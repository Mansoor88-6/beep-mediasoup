import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "@config/logger";
import { events } from "./events";
import { RoomManager } from "./RoomManager";
import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  RtpCapabilities,
  RtpParameters,
  Transport,
  SctpParameters,
} from "mediasoup/node/lib/types";
import { globals } from "@config/globals";

interface WebRtcTransport extends Transport {
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
  sctpParameters: SctpParameters;
}

export default class SocketIO {
  private static instance: SocketIO;
  public static io: SocketServer;
  public static onlineUsers: Map<string, string> = new Map();
  private roomManager: RoomManager;
  private onlineUsersInterval: NodeJS.Timeout | null = null;

  constructor(httpServer: HttpServer) {
    if (!SocketIO.instance) {
      logger.info("[Socket] Initializing Socket.IO server");
      SocketIO.io = new SocketServer(httpServer, {
        cors: {
          origin: "*",
          credentials: true,
        },
      });
      this.roomManager = RoomManager.getInstance();
      this.startOnlineUsersInterval();
    }
    return SocketIO.instance;
  }

  private startOnlineUsersInterval(): void {
    // Clear any existing interval
    if (this.onlineUsersInterval) {
      clearInterval(this.onlineUsersInterval);
    }

    this.onlineUsersInterval = setInterval(() => {
      this.broadcastOnlineUsers();
    }, 60000);
  }

  private broadcastOnlineUsers(): void {
    const onlineUsersList = Array.from(SocketIO.onlineUsers.keys());
    logger.info(
      `[Socket] Broadcasting online users: ${onlineUsersList.length} users`
    );

    SocketIO.io.emit(events.ONLINE_USERS_UPDATE, {
      onlineUsers: onlineUsersList,
    });
  }

  public static getInstance(httpServer: HttpServer): SocketIO {
    if (!SocketIO.instance) {
      SocketIO.instance = new SocketIO(httpServer);
    }
    return SocketIO.instance;
  }

  public async connect(): Promise<void> {
    this.initializeSocketEvents();
    logger.info("[Socket] Socket server connected successfully");
  }

  private initializeSocketEvents(): void {
    SocketIO.io.on(events.CONNECT, (socket) => {
      logger.info(`[Socket] New connection: ${socket.id}`);

      socket.on(events.ADD_USER, (userId: string) => {
        logger.info(`[Socket] User ${userId} came online`);
        SocketIO.onlineUsers.set(userId, socket.id);
        // Broadcast online users immediately when a new user connects
        this.broadcastOnlineUsers();
      });

      socket.on(events.DISCONNECT, () => {
        logger.info(`[Socket] Client disconnected: ${socket.id}`);
        SocketIO.onlineUsers.forEach((socketId, userId) => {
          if (socketId === socket.id) {
            SocketIO.onlineUsers.delete(userId);
          }
        });
        // Broadcast online users immediately when a user disconnects
        this.broadcastOnlineUsers();
      });

      // MediaSoup Events
      socket.on(
        events.CREATE_ROOM,
        async (
          data: {
            roomId: string;
            toUserIds: string[];
            toUsernames: { [key: string]: string };
            isVideo: boolean;
            fromUsername: string;
            groupName?: string;
            chatId: string;
            deviceInfo?: {
              browser?: string;
              os?: string;
              device?: string;
            };
          },
          callback: (response: { error?: string; data?: any }) => void
        ) => {
          try {
            console.log("callback", callback);
            console.log("data", data);
            const room = await this.roomManager.createRoom(data.roomId);

            const fromUserId = Array.from(SocketIO.onlineUsers.entries()).find(
              ([_, socketId]) => socketId === socket.id
            )?.[0];

            if (!fromUserId) {
              callback({ error: "Caller not found" });
              return;
            }

            // Create call log
            // const { callLog } = await CallLogService.createCallLog(
            //   data.chatId,
            //   data.isVideo ? CallType.VIDEO : CallType.AUDIO,
            //   fromUserId,
            //   data.toUserIds,
            //   data.deviceInfo
            // );

            // Format participants as objects with id and username
            const participants = [
              { id: fromUserId, username: data.fromUsername },
              ...data.toUserIds.map((id) => ({
                id,
                username: data.toUsernames[id] || "",
              })),
            ];

            data.toUserIds.forEach((toUserId) => {
              const recipientSocketId = SocketIO.onlineUsers.get(toUserId);
              if (recipientSocketId) {
                socket.to(recipientSocketId).emit("incoming_call", {
                  roomId: data.roomId,
                  fromUserId: fromUserId,
                  fromUsername: data.fromUsername,
                  isVideo: data.isVideo,
                  participants: participants,
                  isGroup: data.toUserIds.length > 1,
                  groupName: data.groupName,
                  // callLogId: callLog._id.toString(),
                });
              }
            });

            console.log("room", room);

            callback({
              data: {
                roomId: room.id,
                routerRtpCapabilities: room.router.rtpCapabilities,
                // callLogId: callLog._id.toString(),
              },
            });
          } catch (error) {
            logger.error(`[Socket:CREATE_ROOM] Error:`, error);
            callback({ error: "Failed to create room" });
          }
        }
      );

      socket.on(
        events.JOIN_ROOM,
        async (
          data: {
            roomId: string;
            userId: string;
            userName: string;
            callLogId: string;
            deviceInfo?: {
              browser?: string;
              os?: string;
              device?: string;
            };
            sctpCapabilities?: any;
          },
          callback: (response: { error?: string; data?: any }) => void
        ) => {
          try {
            const room = await this.roomManager.getRoom(data.roomId);

            if (!room) {
              callback({ error: "Room not found" });
              return;
            }

            // Update call log for joined participant
            // await CallLogService.updateParticipantStatus(
            //   data.callLogId,
            //   data.userId,
            //   CallStatus.ACCEPTED,
            //   data.deviceInfo
            // );

            const peer = await this.roomManager.createPeer(
              data.roomId,
              data.userId,
              data.userName
            );

            // Notify other peers in the room about the new peer joining
            room.peers.forEach((_, otherPeerId) => {
              if (otherPeerId !== data.userId) {
                const otherSocketId = SocketIO.onlineUsers.get(otherPeerId);
                if (otherSocketId) {
                  socket.to(otherSocketId).emit("call_accepted", {
                    roomId: data.roomId,
                    userId: data.userId,
                    userName: data.userName,
                  });
                }
              }
            });

            // Create send transport
            // Create send transport
            const sendTransport = await this.roomManager.createWebRtcTransport(
              data.roomId,
              data.userId,
              "send",
              data.sctpCapabilities
            );

            // Create receive transport
            const receiveTransport =
              await this.roomManager.createWebRtcTransport(
                data.roomId,
                data.userId,
                "receive",
                data.sctpCapabilities
              );

              const transportData = {
                send: {
                  id: sendTransport.id,
                  iceParameters: (sendTransport as WebRtcTransport).iceParameters,
                  iceCandidates: (sendTransport as WebRtcTransport).iceCandidates,
                  dtlsParameters: (sendTransport as WebRtcTransport)
                    .dtlsParameters,
                  sctpParameters: (sendTransport as WebRtcTransport)
                    .sctpParameters,
                },
                receive: {
                  id: receiveTransport.id,
                  iceParameters: (receiveTransport as WebRtcTransport)
                    .iceParameters,
                  iceCandidates: (receiveTransport as WebRtcTransport)
                    .iceCandidates,
                  dtlsParameters: (receiveTransport as WebRtcTransport)
                    .dtlsParameters,
                  sctpParameters: (receiveTransport as WebRtcTransport)
                    .sctpParameters,
                },
              };

            callback({
              data: {
                routerRtpCapabilities: room.router.rtpCapabilities,
                transportOptions: transportData,
              },
            });
          } catch (error) {
            logger.error(`[Socket:JOIN_ROOM] Error:`, error);
            callback({ error: "Failed to join room" });
          }
        }
      );

      socket.on(
        events.CONNECT_TRANSPORT,
        async (
          data: {
            roomId: string;
            userId: string;
            transportId: string;
            dtlsParameters: DtlsParameters;
          },
          callback: (error: any) => void
        ) => {
          try {
            const peer = this.roomManager.getPeer(data.roomId, data.userId);
            if (!peer) {
              callback({ error: "[Socket:CONNECT_TRANSPORT] Peer not found" });
              return;
            }

            const transport = peer.transports.get(data.transportId);
            if (!transport) {
              callback({
                error: "[Socket:CONNECT_TRANSPORT] Transport not found",
              });
              return;
            }

            await transport.connect({ dtlsParameters: data.dtlsParameters });
            callback(null);
          } catch (error) {
            logger.error(`[Socket:CONNECT_TRANSPORT] Error:`, error);
            callback({ error: "Failed to connect transport" });
          }
        }
      );

      socket.on(
        events.PRODUCE,
        async (
          data: {
            roomId: string;
            userId: string;
            transportId: string;
            kind: string;
            rtpParameters: RtpParameters;
          },
          callback: (response: { error?: string; data?: any }) => void
        ) => {
          try {
            const peer = this.roomManager.getPeer(data.roomId, data.userId);
            if (!peer) {
              callback({ error: "[Socket:PRODUCE] Peer not found" });
              return;
            }

            const transport = peer.transports.get(data.transportId);
            if (!transport) {
              callback({ error: "[Socket:PRODUCE] Transport not found" });
              return;
            }

            const producer = await transport.produce({
              kind: data.kind as "audio" | "video",
              rtpParameters: data.rtpParameters,
            });

            peer.producers.set(producer.id, producer);
            producer.on("transportclose", () => {
              producer.close();
              peer.producers.delete(producer.id);
            });

            // Notify other peers in the room about the new producer
            const room = this.roomManager.getRoom(data.roomId);
            if (room) {
              room.peers.forEach((otherPeer, otherPeerId) => {
                if (otherPeerId !== data.userId) {
                  const otherSocketId = SocketIO.onlineUsers.get(otherPeerId);
                  if (otherSocketId) {
                    socket.to(otherSocketId).emit(events.NEW_PRODUCER, {
                      producerId: producer.id,
                      producerPeerId: data.userId,
                      kind: data.kind,
                    });
                  }
                }
              });
            }

            callback({ data: { id: producer.id } });
          } catch (error) {
            logger.error(`[Socket:PRODUCE] Error:`, error);
            callback({ error: "[Socket:PRODUCE] Failed to produce" });
          }
        }
      );

      socket.on(
        events.CONSUME,
        async (
          data: {
            roomId: string;
            userId: string;
            producerId: string;
            rtpCapabilities: RtpCapabilities;
          },
          callback: (response: { error?: string; data?: any }) => void
        ) => {
          try {
            const room = this.roomManager.getRoom(data.roomId);
            if (!room) {
              callback({ error: "[Socket:CONSUME] Room not found" });
              return;
            }

            const peer = this.roomManager.getPeer(data.roomId, data.userId);
            if (!peer) {
              callback({ error: "[Socket:CONSUME] Peer not found" });
              return;
            }

            if (
              !room.router.canConsume({
                producerId: data.producerId,
                rtpCapabilities: data.rtpCapabilities,
              })
            ) {
              callback({ error: "Cannot consume" });
              return;
            }

            // Find the receive transport
            const transport = Array.from(peer.transports.values()).find(
              (t) => t.appData.type === "receive"
            );

            if (!transport) {
              callback({ error: "Receive transport not found" });
              return;
            }

            const consumer = await transport.consume({
              producerId: data.producerId,
              rtpCapabilities: data.rtpCapabilities,
              paused: true,
            });

            peer.consumers.set(consumer.id, consumer);

            consumer.on("transportclose", () => {
              consumer.close();
              peer.consumers.delete(consumer.id);
            });

            consumer.on("producerclose", () => {
              consumer.close();
              peer.consumers.delete(consumer.id);
              socket.emit(events.PRODUCER_CLOSED, { consumerId: consumer.id });
            });

            callback({
              data: {
                id: consumer.id,
                producerId: data.producerId,
                kind: consumer.kind,
                rtpParameters: consumer.rtpParameters,
              },
            });
          } catch (error) {
            logger.error(`[Socket:CONSUME] Error:`, error);
            callback({ error: "Failed to consume" });
          }
        }
      );

      socket.on(
        events.RESUME_CONSUMER,
        async (
          data: {
            roomId: string;
            userId: string;
            consumerId: string;
          },
          callback: (error: any) => void
        ) => {
          try {
            const peer = this.roomManager.getPeer(data.roomId, data.userId);
            if (!peer) {
              callback({ error: "[Socket:RESUME_CONSUMER] Peer not found" });
              return;
            }

            const consumer = peer.consumers.get(data.consumerId);
            if (!consumer) {
              callback({ error: "Consumer not found" });
              return;
            }

            await consumer.resume();
            callback(null);
          } catch (error) {
            logger.error(`[Socket:RESUME_CONSUMER] Error:`, error);
            callback({ error: "Failed to resume consumer" });
          }
        }
      );

      socket.on(
        events.LEAVE_ROOM,
        async (data: {
          roomId: string;
          userId: string;
          // callLogId: string;
          quality?: {
            avgBitrate?: number;
            packetLoss?: number;
            latency?: number;
          };
        }) => {
          try {
            const room = this.roomManager.getRoom(data.roomId);

            // Update call log for leaving participant
            // await CallLogService.updateParticipantStatus(
            //   data.callLogId,
            //   data.userId,
            //   CallStatus.LEFT
            // );

            // Notify other participants before closing the peer
            if (room) {
              room.peers.forEach((_, otherPeerId) => {
                if (otherPeerId !== data.userId) {
                  const otherSocketId = SocketIO.onlineUsers.get(otherPeerId);
                  if (otherSocketId) {
                    SocketIO.io.to(otherSocketId).emit(events.PEER_LEFT, {
                      peerId: data.userId,
                      roomId: data.roomId,
                    });
                  }
                }
              });
            }

            await this.roomManager.closePeer(data.roomId, data.userId);

            // Close room and end call log if no peers left
            if (room && room.peers.size === 0) {
              await this.roomManager.closeRoom(data.roomId);
              // await CallLogService.endCall(data.callLogId, data.quality);
            }
          } catch (error) {
            logger.error(`[Socket:LEAVE_ROOM] Error:`, error);
          }
        }
      );

      socket.on(
        events.GET_PRODUCER,
        async (
          data: { roomId: string; userId: string },
          callback: (response: { error?: string; data?: any }) => void
        ) => {
          try {
            const room = this.roomManager.getRoom(data.roomId);
            if (!room) {
              callback({ error: "Room not found" });
              return;
            }

            const producers: Array<{
              producerId: string;
              producerPeerId: string;
              kind: string;
            }> = [];

            // Collect all producers from all peers except the requesting user
            room.peers.forEach((peer, peerId) => {
              if (peerId !== data.userId) {
                peer.producers.forEach((producer, producerId) => {
                  producers.push({
                    producerId: producerId,
                    producerPeerId: peerId,
                    kind: producer.kind,
                  });
                });
              }
            });

            callback({ data: producers });
          } catch (error) {
            logger.error(`[Socket:GET_PRODUCER] Error:`, error);
            callback({ error: "Failed to get producers" });
          }
        }
      );

      // Add new event handler for rejected calls
      socket.on(
        events.REJECT_CALL,
        async (data: { callLogId: string; userId: string }) => {
          try {
            // await CallLogService.updateParticipantStatus(
            //   data.callLogId,
            //   data.userId,
            //   CallStatus.REJECTED
            // );
          } catch (error) {
            logger.error(`[Socket:REJECT_CALL] Error:`, error);
          }
        }
      );

      // Add new event handler for missed calls
      socket.on(
        events.MISSED_CALL,
        async (data: { callLogId: string; userId: string }) => {
          try {
            // await CallLogService.updateParticipantStatus(
            //   data.callLogId,
            //   data.userId,
            //   CallStatus.MISSED
            // );
          } catch (error) {
            logger.error(`[Socket:MISSED_CALL] Error:`, error);
          }
        }
      );

      // Add handler for busy status
      socket.on(
        events.BUSY_CALL,
        async (data: { callLogId: string; userId: string }) => {
          try {
            // Update the participant status to BUSY
            // const callLog = await CallLogService.updateParticipantStatus(
            //   data.callLogId,
            //   data.userId,
            //   CallStatus.BUSY
            // );
            // Find the caller to notify them that the recipient is busy
            // if (callLog) {
            //   // Find the initiator participant
            //   const initiator = callLog.participants.find(
            //     (p: any) => p.role === "initiator"
            //   );
            //   if (initiator) {
            //     const initiatorSocketId = SocketIO.onlineUsers.get(
            //       initiator.userId.toString()
            //     );
            //     if (initiatorSocketId) {
            //       // Notify the caller that the recipient is busy
            //       SocketIO.io
            //         .to(initiatorSocketId)
            //         .emit(events.CALL_STATUS_UPDATE, {
            //           callLogId: data.callLogId,
            //           userId: data.userId,
            //           status: CallStatus.BUSY,
            //         });
            //     }
            //   }
            // }
          } catch (error) {
            logger.error(`[Socket:BUSY_CALL] Error:`, error);
          }
        }
      );
    });
  }
}
