import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { logger } from "@config/logger";
import { events } from "./events";
import Chat from "@models/components/chat/chat";
import { Types } from "mongoose";
import { RoomManager } from "./RoomManager";
import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  RtpCapabilities,
  RtpParameters,
  MediaKind,
  Transport,
} from "mediasoup/node/lib/types";
import { CallLogService } from "@services/components/call/callLog";
import { CallStatus, CallType } from "@models/components/callLog/types";
import { MessageEncryptionService } from "@services/helper/messageEncryption";

interface WebRtcTransport extends Transport {
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
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
    }, 60000); // 60000 ms = 1 minute
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

      socket.on(
        events.SEND_MESSAGE,
        async (
          data: { chatId: string; message: any; tempId: string },
          callback: (response: { error?: string; data?: any }) => void
        ) => {
          try {
            console.log(`[Socket:SEND_MESSAGE] Event triggered`, {
              from: socket.id,
              chatId: data.chatId,
              tempId: data.tempId,
              message: data.message,
            });

            const { _id, ...messageWithoutTempId } = data.message;

            // Get the chat to access its encryption key
            const chat = await Chat.findOne({
              _id: data.chatId,
              "participants._id": messageWithoutTempId.senderId,
            });

            if (!chat) {
              logger.error(
                `[Socket:SEND_MESSAGE] Chat not found or unauthorized`
              );
              if (callback)
                callback({ error: "Chat not found or unauthorized" });
              return;
            }

            // Create a proper message object that matches the schema
            const messageData: {
              _id: string;
              senderId: string;
              text: string;
              timestamp: Date;
              seenBy: string[];
              isSent: boolean;
              media?: {
                url: string;
                thumbnailUrl?: string;
                type: string;
                fileName: string;
                fileSize: number;
                mimeType: string;
                width?: number;
                height?: number;
                duration?: number;
              };
            } = {
              _id: new Types.ObjectId().toString(),
              senderId: new Types.ObjectId(
                messageWithoutTempId.senderId
              ).toString(),
              text: messageWithoutTempId.text || "",
              timestamp: new Date(),
              seenBy: [],
              isSent: false,
            };

            // Handle media if present
            if (
              messageWithoutTempId.media &&
              Object.keys(messageWithoutTempId.media).length > 0
            ) {
              const media = messageWithoutTempId.media;

              const mediaData: {
                url: string;
                type: string;
                fileName: string;
                fileSize: number;
                mimeType: string;
                width?: number;
                height?: number;
                thumbnailUrl?: string;
                duration?: number;
              } = {
                url: media.url,
                type: media.type,
                fileName: media.fileName || media.filename,
                fileSize: media.fileSize,
                mimeType: media.mimeType,
              };

              if (typeof media.width === "number")
                mediaData.width = media.width;
              if (typeof media.height === "number")
                mediaData.height = media.height;
              if (media.thumbnailUrl || media.thumbnail) {
                mediaData.thumbnailUrl = media.thumbnailUrl || media.thumbnail;
              }
              if (media.type === "voice" || media.type === "video") {
                mediaData.duration = media.duration;
              }

              const requiredFields = [
                "url",
                "type",
                "fileName",
                "fileSize",
                "mimeType",
              ] as const;
              const missingFields = requiredFields.filter(
                (field) => !mediaData[field as keyof typeof mediaData]
              );

              if (missingFields.length > 0) {
                logger.error(
                  `[Socket:SEND_MESSAGE] Missing required media fields: ${missingFields.join(
                    ", "
                  )}`
                );
                if (callback)
                  callback({
                    error: `Missing required media fields: ${missingFields.join(
                      ", "
                    )}`,
                  });
                return;
              }

              messageData.media = mediaData;
            }

            // Encrypt the message content
            if (messageData.text) {
              messageData.text = MessageEncryptionService.encryptMessage(
                messageData.text,
                chat.encryptionKey
              );
            }

            // If there's media, encrypt its metadata
            if (messageData.media) {
              const encryptedMedia = MessageEncryptionService.encryptMessage(
                messageData.media,
                chat.encryptionKey
              );
              messageData.media = JSON.parse(
                MessageEncryptionService.decryptMessage(
                  encryptedMedia,
                  chat.encryptionKey
                )
              );
            }

            // Store encrypted message in chat
            chat.messages.push(messageData);
            chat.lastMessage = messageWithoutTempId.media
              ? `Sent a ${messageWithoutTempId.media.type}`
              : messageWithoutTempId.text || "";
            chat.updatedAt = new Date();

            const updatedChat = await chat.save();

            // Create a decrypted version for sending in responses
            const decryptedMessageData = { ...messageData };
            if (decryptedMessageData.text) {
              decryptedMessageData.text =
                MessageEncryptionService.decryptMessage(
                  decryptedMessageData.text,
                  chat.encryptionKey
                );
            }
            let messageSentToAnyParticipant = false;
            const deliveryPromises = chat.participants
              .filter((p) => p._id.toString() !== messageWithoutTempId.senderId)
              .map(async (participant) => {
                const receiverSocketId = SocketIO.onlineUsers.get(
                  participant._id.toString()
                );

                if (receiverSocketId) {
                  try {
                    socket.to(receiverSocketId).emit(events.RECEIVE_MESSAGE, {
                      chatId: data.chatId,
                      message: decryptedMessageData,
                    });
                    messageSentToAnyParticipant = true;
                    logger.info(
                      `[Socket:SEND_MESSAGE] Message delivered to: ${participant._id}`
                    );
                  } catch (err) {
                    logger.error(
                      `[Socket:SEND_MESSAGE] Failed to deliver to: ${participant._id}`,
                      err
                    );
                  }
                }
              });

            await Promise.all(deliveryPromises);

            const shouldMarkAsSent =
              chat.type === "group"
                ? messageSentToAnyParticipant
                : messageSentToAnyParticipant && chat.participants.length === 2;

            if (shouldMarkAsSent) {
              const finalChat = await Chat.findOneAndUpdate(
                {
                  _id: data.chatId,
                  "messages._id": messageData._id,
                },
                {
                  $set: { "messages.$.isSent": true },
                },
                { new: true }
              );

              const senderSocketId = SocketIO.onlineUsers.get(
                messageWithoutTempId.senderId
              );
              if (senderSocketId) {
                SocketIO.io
                  .to(senderSocketId)
                  .emit(events.MESSAGE_STATUS_UPDATE, {
                    chatId: data.chatId,
                    messageId: messageData._id.toString(),
                    tempId: data.tempId,
                    isSent: true,
                  });
              }

              if (callback) {
                callback({
                  data: {
                    chat: finalChat,
                    message: { ...decryptedMessageData, isSent: true },
                    tempId: data.tempId,
                  },
                });
              }
            } else {
              if (callback) {
                callback({
                  data: {
                    chat: updatedChat,
                    message: decryptedMessageData,
                    tempId: data.tempId,
                  },
                });
              }
            }
          } catch (error) {
            logger.error(`[Socket:SEND_MESSAGE] Error:`, error);
            if (callback) callback({ error: "Internal server error" });
          }
        }
      );

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
            console.log("[Socket:CREATE_ROOM] triggered", data);
            const room = await this.roomManager.createRoom(data.roomId);

            console.log("[Socket:CREATE_ROOM] room created", room);
            console.log("socket.onlineUsers", SocketIO.onlineUsers);
            const fromUserId = Array.from(SocketIO.onlineUsers.entries()).find(
              ([_, socketId]) => socketId === socket.id
            )?.[0];

            if (!fromUserId) {
              callback({ error: "Caller not found" });
              return;
            }

            // Create call log
            const { callLog } = await CallLogService.createCallLog(
              data.chatId,
              data.isVideo ? CallType.VIDEO : CallType.AUDIO,
              fromUserId,
              data.toUserIds,
              data.deviceInfo
            );

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
                console.log("Emitting incoming_call to", recipientSocketId);
                socket.to(recipientSocketId).emit("incoming_call", {
                  roomId: data.roomId,
                  fromUserId: fromUserId,
                  fromUsername: data.fromUsername,
                  isVideo: data.isVideo,
                  participants: participants,
                  isGroup: data.toUserIds.length > 1,
                  groupName: data.groupName,
                  callLogId: callLog._id.toString(),
                });
              }
            });

            callback({
              data: {
                roomId: room.id,
                callLogId: callLog._id.toString(),
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
          },
          callback: (response: { error?: string; data?: any }) => void
        ) => {
          try {
            console.log("JOIN_ROOM triggered", data);
            const room = await this.roomManager.getRoom(data.roomId);
            console.log("Room found", room);
            if (!room) {
              callback({ error: "Room not found" });
              return;
            }

            // Update call log for joined participant
            await CallLogService.updateParticipantStatus(
              data.callLogId,
              data.userId,
              CallStatus.ACCEPTED,
              data.deviceInfo
            );

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
            const sendTransport = await this.roomManager.createWebRtcTransport(
              data.roomId,
              data.userId,
              "send"
            );

            // Create receive transport
            const receiveTransport =
              await this.roomManager.createWebRtcTransport(
                data.roomId,
                data.userId,
                "receive"
              );

            console.log("Transports created", {
              sendTransport,
              receiveTransport,
            });

            const transportData = {
              send: {
                id: sendTransport.id,
                iceParameters: (sendTransport as WebRtcTransport).iceParameters,
                iceCandidates: (sendTransport as WebRtcTransport).iceCandidates,
                dtlsParameters: (sendTransport as WebRtcTransport)
                  .dtlsParameters,
              },
              receive: {
                id: receiveTransport.id,
                iceParameters: (receiveTransport as WebRtcTransport)
                  .iceParameters,
                iceCandidates: (receiveTransport as WebRtcTransport)
                  .iceCandidates,
                dtlsParameters: (receiveTransport as WebRtcTransport)
                  .dtlsParameters,
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
            console.log("[Socket:CONNECT_TRANSPORT] triggered", data);
            const peer = this.roomManager.getPeer(data.roomId, data.userId);
            console.log("[Socket:CONNECT_TRANSPORT] Peer found", peer);
            if (!peer) {
              callback({ error: "[Socket:CONNECT_TRANSPORT] Peer not found" });
              return;
            }

            const transport = peer.transports.get(data.transportId);
            console.log(
              "[Socket:CONNECT_TRANSPORT] Transport found",
              transport
            );
            if (!transport) {
              callback({
                error: "[Socket:CONNECT_TRANSPORT] Transport not found",
              });
              return;
            }

            await transport.connect({ dtlsParameters: data.dtlsParameters });
            console.log("[Socket:CONNECT_TRANSPORT] Transport connected");
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
            console.log("[Socket:PRODUCE] triggered", data);
            const peer = this.roomManager.getPeer(data.roomId, data.userId);
            console.log("[Socket:PRODUCE] Peer found", peer);
            if (!peer) {
              callback({ error: "[Socket:PRODUCE] Peer not found" });
              return;
            }

            const transport = peer.transports.get(data.transportId);
            console.log("[Socket:PRODUCE] Transport found", transport);
            if (!transport) {
              callback({ error: "[Socket:PRODUCE] Transport not found" });
              return;
            }

            const producer = await transport.produce({
              kind: data.kind as "audio" | "video",
              rtpParameters: data.rtpParameters,
            });

            console.log("[Socket:PRODUCE] Producer created", producer);

            peer.producers.set(producer.id, producer);

            console.log("[Socket:PRODUCE] Producer added to peer", peer);
            producer.on("transportclose", () => {
              producer.close();
              peer.producers.delete(producer.id);
            });

            console.log("[Socket:PRODUCE] Producer closed event added");

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

            console.log("[Socket:PRODUCE] Producer created", producer);
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
            console.log("[Socket:RESUME_CONSUMER] triggered", data);
            const peer = this.roomManager.getPeer(data.roomId, data.userId);
            if (!peer) {
              callback({ error: "[Socket:RESUME_CONSUMER] Peer not found" });
              return;
            }

            const consumer = peer.consumers.get(data.consumerId);
            console.log("[Socket:RESUME_CONSUMER] Consumer found", consumer);
            if (!consumer) {
              callback({ error: "Consumer not found" });
              return;
            }

            await consumer.resume();
            console.log("[Socket:RESUME_CONSUMER] Consumer resumed");
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
          callLogId: string;
          quality?: {
            avgBitrate?: number;
            packetLoss?: number;
            latency?: number;
          };
        }) => {
          try {
            console.log("[Socket:LEAVE_ROOM] triggered", data);
            const room = this.roomManager.getRoom(data.roomId);

            // Update call log for leaving participant
            await CallLogService.updateParticipantStatus(
              data.callLogId,
              data.userId,
              CallStatus.LEFT
            );

            // Notify other participants before closing the peer
            if (room) {
              room.peers.forEach((_, otherPeerId) => {
                if (otherPeerId !== data.userId) {
                  const otherSocketId = SocketIO.onlineUsers.get(otherPeerId);
                  if (otherSocketId) {
                    console.log("Emitting PEER_LEFT event to", otherSocketId);
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
              await CallLogService.endCall(data.callLogId, data.quality);
            }
          } catch (error) {
            logger.error(`[Socket:LEAVE_ROOM] Error:`, error);
          }
        }
      );

      socket.on(
        events.ACKNOWLEDGE_MESSAGES,
        async (data: { chatId: string; receiverId: string }) => {
          try {
            console.log("[Socket:ACKNOWLEDGE_MESSAGES] triggered", data);
            logger.info(
              `[Socket:ACKNOWLEDGE_MESSAGES] Processing acknowledgment`,
              {
                chatId: data.chatId,
                receiverId: data.receiverId,
              }
            );

            const chat = await Chat.findOne({
              _id: data.chatId,
              "participants._id": data.receiverId,
            });

            if (!chat) {
              logger.error(
                `[Socket:ACKNOWLEDGE_MESSAGES] Chat not found or user not participant`
              );
              return;
            }

            const undeliveredMessages = chat.messages.filter(
              (msg: any) =>
                msg.senderId !== data.receiverId &&
                (!msg.seenBy || !msg.seenBy.includes(data.receiverId))
            );
            console.log(
              "[Socket:ACKNOWLEDGE_MESSAGES] Undelivered messages",
              undeliveredMessages
            );

            if (undeliveredMessages.length === 0) {
              logger.info(
                `[Socket:ACKNOWLEDGE_MESSAGES] No undelivered messages found`
              );
              return;
            }

            await Chat.findOneAndUpdate(
              { _id: data.chatId },
              {
                $set: {
                  "messages.$[elem].isSent": true,
                },
                $addToSet: {
                  "messages.$[elem].seenBy": data.receiverId,
                },
              },
              {
                arrayFilters: [
                  {
                    "elem.senderId": { $ne: data.receiverId },
                    "elem.seenBy": { $ne: data.receiverId },
                  },
                ],
                new: true,
              }
            );

            const senderIds = new Set(
              undeliveredMessages.map((msg: any) => msg.senderId)
            );

            senderIds.forEach((senderId) => {
              const senderSocketId = SocketIO.onlineUsers.get(
                senderId.toString()
              );

              if (senderSocketId) {
                undeliveredMessages.forEach((msg: any) => {
                  if (msg.senderId.toString() === senderId.toString()) {
                    SocketIO.io
                      .to(senderSocketId)
                      .emit(events.MESSAGE_STATUS_UPDATE, {
                        chatId: data.chatId,
                        messageId: msg._id.toString(),
                        isSent: true,
                        seenBy: [...(msg.seenBy || []), data.receiverId],
                      });
                  }
                });
              }
            });

            logger.info(
              `[Socket:ACKNOWLEDGE_MESSAGES] Successfully updated message statuses`,
              {
                chatId: data.chatId,
                updatedCount: undeliveredMessages.length,
              }
            );
          } catch (error) {
            logger.error(`[Socket:ACKNOWLEDGE_MESSAGES] Error:`, error);
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
            await CallLogService.updateParticipantStatus(
              data.callLogId,
              data.userId,
              CallStatus.REJECTED
            );
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
            await CallLogService.updateParticipantStatus(
              data.callLogId,
              data.userId,
              CallStatus.MISSED
            );
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
            await CallLogService.updateParticipantStatus(
              data.callLogId,
              data.userId,
              CallStatus.BUSY
            );
          } catch (error) {
            logger.error(`[Socket:BUSY_CALL] Error:`, error);
          }
        }
      );

      socket.on(
        events.SEND_REACTION,
        async (
          data: {
            messageId: string;
            emoji: string;
            userId: string;
            username: string;
          },
          callback: (response: { error?: string; data?: any }) => void
        ) => {
          try {
            console.log("[Socket:SEND_REACTION] triggered", data);
            // Find the chat containing the message
            const chat = await Chat.findOne({
              "messages._id": data.messageId,
              "participants._id": data.userId,
            });

            if (!chat) {
              callback({ error: "Chat not found or unauthorized" });
              return;
            }

            // Add the reaction
            const updatedChat = await Chat.findOneAndUpdate(
              {
                _id: chat._id,
                "messages._id": data.messageId,
              },
              {
                $pull: {
                  "messages.$.reactions": {
                    userId: new Types.ObjectId(data.userId),
                  },
                },
              },
              { new: true }
            );

            if (!updatedChat) {
              callback({ error: "Failed to update reaction" });
              return;
            }

            // Now add the new reaction
            const finalChat = await Chat.findOneAndUpdate(
              {
                _id: chat._id,
                "messages._id": data.messageId,
              },
              {
                $push: {
                  "messages.$.reactions": {
                    emoji: data.emoji,
                    userId: new Types.ObjectId(data.userId),
                    username: data.username,
                    timestamp: new Date(),
                  },
                },
              },
              { new: true }
            );

            if (!finalChat) {
              callback({ error: "Failed to add reaction" });
              return;
            }

            // Find the updated message
            const message = finalChat.messages.find(
              (m) => m._id.toString() === data.messageId
            );

            if (!message) {
              callback({ error: "Message not found" });
              return;
            }

            // Create a decrypted copy of the message
            const decryptedMessage = JSON.parse(JSON.stringify(message));
            if (decryptedMessage.text) {
              decryptedMessage.text = MessageEncryptionService.decryptMessage(
                decryptedMessage.text,
                chat.encryptionKey
              );
            }

            // Notify other participants
            chat.participants.forEach((participant) => {
              if (participant._id.toString() !== data.userId) {
                const recipientSocketId = SocketIO.onlineUsers.get(
                  participant._id.toString()
                );
                if (recipientSocketId) {
                  socket.to(recipientSocketId).emit(events.REACTION_RECEIVED, {
                    chatId: chat._id,
                    messageId: data.messageId,
                    reaction: {
                      emoji: data.emoji,
                      userId: data.userId,
                      username: data.username,
                      timestamp: new Date(),
                    },
                  });
                }
              }
            });

            callback({ data: { message: decryptedMessage } });
          } catch (error) {
            logger.error("[Socket:SEND_REACTION] Error:", error);
            callback({ error: "Internal server error" });
          }
        }
      );

      socket.on(
        events.REMOVE_REACTION,
        async (
          data: {
            messageId: string;
            emoji: string;
            userId: string;
          },
          callback: (response: { error?: string; data?: any }) => void
        ) => {
          try {
            console.log("[Socket:REMOVE_REACTION] triggered", data);
            // Find the chat containing the message
            const chat = await Chat.findOne({
              "messages._id": data.messageId,
              "participants._id": data.userId,
            });

            if (!chat) {
              callback({ error: "Chat not found or unauthorized" });
              return;
            }

            // Remove the reaction
            const updatedChat = await Chat.findOneAndUpdate(
              {
                _id: chat._id,
                "messages._id": data.messageId,
              },
              {
                $pull: {
                  "messages.$.reactions": {
                    emoji: data.emoji,
                    userId: new Types.ObjectId(data.userId),
                  },
                },
              },
              { new: true }
            );

            if (!updatedChat) {
              callback({ error: "Failed to remove reaction" });
              return;
            }

            // Find the updated message
            const message = updatedChat.messages.find(
              (m) => m._id.toString() === data.messageId
            );

            // Notify other participants
            chat.participants.forEach((participant) => {
              if (participant._id.toString() !== data.userId) {
                const recipientSocketId = SocketIO.onlineUsers.get(
                  participant._id.toString()
                );
                if (recipientSocketId) {
                  socket.to(recipientSocketId).emit(events.REACTION_REMOVED, {
                    chatId: chat._id,
                    messageId: data.messageId,
                    reaction: {
                      emoji: data.emoji,
                      userId: data.userId,
                    },
                  });
                }
              }
            });

            callback({ data: { message } });
          } catch (error) {
            logger.error("[Socket:REMOVE_REACTION] Error:", error);
            callback({ error: "Internal server error" });
          }
        }
      );
    });
  }
}
