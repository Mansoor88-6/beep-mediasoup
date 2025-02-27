import { Device } from 'mediasoup-client';
import { Socket } from 'socket.io-client';
import store from 'appRedux/store';
import {
  setOngoingCall,
  setLocalStream,
  addRemoteStream,
  addProducer,
  addConsumer,
  removeConsumer,
  resetCallState,
  setCallInfo
} from 'appRedux/reducers/callReducer';
import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  RtpParameters
} from 'mediasoup-client/lib/types';
import { notification } from 'antd';
import { CALL_STATUS_UPDATE } from 'appRedux/middleware/socket/events';
/**
 * CallService class for handling call-related operations
 */
class CallService {
  private static socket: Socket | null = null;
  private static device: Device | null = null;
  private static sendTransport: any = null;
  private static receiveTransport: any = null;
  private static producers: Map<string, any> = new Map();
  private static consumers: Map<string, any> = new Map();
  private static localStream: MediaStream | null = null;
  private static roomId: string | null = null;
  private static isConnected: boolean = false;

  /**
   * Emit an event asynchronously
   * @param event - The event name
   * @param data - The data to send
   * @param timeout - Optional timeout in milliseconds
   * @returns A promise that resolves to the response
   */
  private static emitAsync<T>(event: string, data: any, timeout: number = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${event} response`));
      }, timeout);

      this.socket.emit(event, data, (response: T) => {
        clearTimeout(timeoutId);
        if (response && (response as any).error) {
          reject((response as any).error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Initialize the CallService with a socket
   * @param socket - The socket instance
   */
  public static initialize(socket: Socket) {
    this.socket = socket;
    this.device = new Device();
  }

  /**
   * Start a call
   * @param roomId - The room ID
   * @param toUserIds - The user IDs to call
   * @param isVideo - Whether to include video in the call
   * @param fromUsername - The username of the caller
   * @param toUsernames - Object mapping user IDs to usernames
   * @param groupName - Optional group name
   * @param chatId - The ID of the chat where the call is initiated
   */
  public static async startCall(
    roomId: string,
    toUserIds: string[],
    isVideo: boolean,
    fromUsername: string,
    toUsernames: { [key: string]: string },
    groupName?: string,
    chatId?: string
  ) {
    try {
      if (!this.socket) throw new Error('Socket not initialized');

      // Clean up any previous call state first
      await this.cleanupPreviousCall();

      // Set up event listeners for the new call
      this.setupCommonEventListeners(roomId);

      // 1. Create room
      const createRoomResponse = await new Promise<{
        error?: any;
        data?: {
          roomId: string;
          callLogId: string;
        };
      }>((resolve, reject) => {
        this.socket?.emit(
          'create_room',
          {
            roomId: roomId,
            toUserIds: toUserIds,
            toUsernames: toUsernames,
            isVideo: isVideo,
            fromUsername: fromUsername,
            groupName: groupName,
            chatId: chatId,
            deviceInfo: {
              browser: navigator.userAgent,
              os: navigator.platform,
              device: 'web'
            }
          },
          (response: any) => {
            if (response?.error) reject(response.error);
            else resolve(response);
          }
        );
      });

      if (createRoomResponse.error) {
        throw new Error(createRoomResponse.error);
      }

      if (!createRoomResponse.data) {
        throw new Error('Failed to create room: No data returned');
      }

      // Store the call log ID in Redux
      store.dispatch(
        setCallInfo({
          callerInfo: {
            username: fromUsername,
            isGroupCall: toUserIds.length > 1,
            groupName: groupName
          },
          callLogId: createRoomResponse.data.callLogId
        })
      );

      // 2. Create device
      this.device = new Device();

      // 3. Join room
      const joinRoomResponse = await this.emitAsync<{
        data: {
          routerRtpCapabilities: any;
          transportOptions: {
            send: {
              id: string;
              iceParameters: IceParameters;
              iceCandidates: IceCandidate[];
              dtlsParameters: DtlsParameters;
            };
            receive: {
              id: string;
              iceParameters: IceParameters;
              iceCandidates: IceCandidate[];
              dtlsParameters: DtlsParameters;
            };
          };
        };
      }>('join_room', {
        roomId: roomId,
        userId: store.getState().auth.user?._id,
        userName: store.getState().auth.user?.username,
        callLogId: createRoomResponse.data.callLogId,
        deviceInfo: {
          browser: navigator.userAgent,
          os: navigator.platform,
          device: 'web'
        }
      });

      // Load the device with router RTP capabilities
      await this.device.load({
        routerRtpCapabilities: joinRoomResponse.data.routerRtpCapabilities
      });

      // Create send and receive transports
      const { send, receive } = joinRoomResponse.data.transportOptions;
      this.sendTransport = this.device.createSendTransport(send);
      this.receiveTransport = this.device.createRecvTransport(receive);

      // Set up transport event handlers
      this.setupTransportHandlers(roomId);

      // Get local media stream BEFORE proceeding with the call
      try {
        // Request media permissions first
        // Force stop any existing tracks before requesting new ones
        if (this.localStream) {
          this.localStream.getTracks().forEach((track) => {
            track.stop();
          });
          this.localStream = null;
        }

        // Clear any existing local stream in Redux
        store.dispatch(setLocalStream(null));

        // Request new media stream with a small delay to ensure previous streams are fully released
        await new Promise((resolve) => {
          return setTimeout(resolve, 100);
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          },
          video: isVideo
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
              }
            : false
        });

        if (!stream.active) {
          throw new Error('Failed to get active media stream');
        }

        // Store the local stream both in the class and in Redux
        this.localStream = stream;
        store.dispatch(setLocalStream(stream));

        // Set call as ongoing in Redux
        store.dispatch(setOngoingCall(true));

        // Produce audio and video tracks
        if (stream.getAudioTracks().length > 0) {
          const audioTrack = stream.getAudioTracks()[0];
          if (audioTrack.readyState === 'ended') {
            throw new Error('Audio track is ended, cannot produce');
          }
          const audioProducer = await this.sendTransport.produce({
            track: audioTrack,
            codecOptions: {
              opusStereo: true,
              opusDtx: true
            }
          });
          store.dispatch(addProducer({ kind: 'audio', producer: audioProducer }));
        }

        if (isVideo && stream.getVideoTracks().length > 0) {
          const videoTrack = stream.getVideoTracks()[0];
          if (videoTrack.readyState === 'ended') {
            throw new Error('Video track is ended, cannot produce');
          }
          const videoProducer = await this.sendTransport.produce({
            track: videoTrack,
            encodings: [
              { maxBitrate: 100000, scaleResolutionDownBy: 4 },
              { maxBitrate: 300000, scaleResolutionDownBy: 2 },
              { maxBitrate: 900000, scaleResolutionDownBy: 1 }
            ],
            codecOptions: {
              videoGoogleStartBitrate: 1000
            }
          });
          store.dispatch(addProducer({ kind: 'video', producer: videoProducer }));
        }

        // After permissions are granted and local stream is set up,
        // check for any existing producers in the room
        await this.refreshRemoteStreams(roomId);
      } catch (error) {
        console.error('Error getting media stream:', error);
        // End the call if we can't get media permissions
        if (error instanceof Error && error.name === 'NotAllowedError') {
          await this.endCall(roomId);
          throw new Error('Media permissions denied');
        }
        throw error;
      }

      return createRoomResponse.data.roomId;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  /**
   * End the current call and clean up resources
   * @param roomId - The room ID of the call to end
   * @param isRejected - Whether the call was rejected
   */
  public static async endCall(roomId: string, isRejected: boolean = false) {
    try {
      // Get callLogId and isIncoming from Redux state before any cleanup
      const callLogId = store.getState().call.callLogId;
      const isIncoming = store.getState().call.isIncoming;

      // Send leave room event first before cleanup if needed
      if (!isRejected && !isIncoming && this.socket && this.socket.connected) {
        try {
          const quality = {
            avgBitrate: this.calculateAverageBitrate(),
            packetLoss: this.calculatePacketLoss(),
            latency: this.calculateLatency()
          };

          // Use a shorter timeout for leave_room
          await this.emitAsync(
            'leave_room',
            {
              roomId: roomId,
              userId: store.getState().auth.user?._id,
              callLogId: callLogId,
              quality: quality
            },
            2000
          ); // 2 second timeout
        } catch (error) {
          console.warn('Non-critical error sending leave_room:', error);
          // Continue with cleanup even if leave_room fails
        }
      }

      // Then do the cleanup
      await this.cleanupPreviousCall();

      // Finally handle rejection if needed
      if (isRejected && isIncoming && callLogId) {
        try {
          await this.emitAsync(
            'reject_call',
            {
              callLogId: callLogId,
              userId: store.getState().auth.user?._id
            },
            2000
          ); // 2 second timeout
        } catch (error) {
          console.warn('Non-critical error sending reject_call:', error);
        }
      }

      // Reset Redux state after everything
      store.dispatch(resetCallState());
    } catch (error) {
      console.error('Error cleaning up call:', error);
      // Ensure Redux state is reset even if cleanup fails
      store.dispatch(resetCallState());
    }
  }

  /**
   * Handle call timeout for unanswered calls
   * @param roomId - The room ID
   */
  public static async handleCallTimeout(roomId: string) {
    try {
      const callLogId = store.getState().call.callLogId;
      const isIncoming = store.getState().call.isIncoming;

      // First end the call to ensure UI cleanup happens immediately
      await this.endCall(roomId);

      // Then update the call log status without waiting
      if (isIncoming && callLogId) {
        // Use regular socket emit instead of emitAsync since we don't need to wait for response
        this.socket?.emit('missed_call', {
          callLogId: callLogId,
          userId: store.getState().auth.user?._id
        });
      }
    } catch (error) {
      console.error('Error handling call timeout:', error);
      // Make sure call gets ended even if there's an error
      await this.endCall(roomId);
    }
  }

  /**
   * Calculate average bitrate of the call
   * @returns The average bitrate in bps, or undefined if not available
   */
  private static calculateAverageBitrate(): number | undefined {
    try {
      let totalBitrate = 0;
      let count = 0;

      // Calculate bitrate from producers
      this.producers.forEach((producer) => {
        const stats = producer.getStats();
        if (stats && stats.bitrate) {
          totalBitrate += stats.bitrate;
          count++;
        }
      });

      // Calculate bitrate from consumers
      this.consumers.forEach((consumer) => {
        const stats = consumer.getStats();
        if (stats && stats.bitrate) {
          totalBitrate += stats.bitrate;
          count++;
        }
      });

      return count > 0 ? totalBitrate / count : undefined;
    } catch (error) {
      console.error('Error calculating average bitrate:', error);
      return undefined;
    }
  }

  /**
   * Calculate packet loss percentage
   * @returns The packet loss percentage, or undefined if not available
   */
  private static calculatePacketLoss(): number | undefined {
    try {
      let totalPacketLoss = 0;
      let count = 0;

      // Calculate packet loss from producers
      this.producers.forEach((producer) => {
        const stats = producer.getStats();
        if (stats && stats.packetLoss) {
          totalPacketLoss += stats.packetLoss;
          count++;
        }
      });

      // Calculate packet loss from consumers
      this.consumers.forEach((consumer) => {
        const stats = consumer.getStats();
        if (stats && stats.packetLoss) {
          totalPacketLoss += stats.packetLoss;
          count++;
        }
      });

      return count > 0 ? totalPacketLoss / count : undefined;
    } catch (error) {
      console.error('Error calculating packet loss:', error);
      return undefined;
    }
  }

  /**
   * Calculate average latency
   * @returns The average latency in milliseconds, or undefined if not available
   */
  private static calculateLatency(): number | undefined {
    try {
      let totalLatency = 0;
      let count = 0;

      // Calculate latency from producers
      this.producers.forEach((producer) => {
        const stats = producer.getStats();
        if (stats && stats.rtt) {
          totalLatency += stats.rtt;
          count++;
        }
      });

      // Calculate latency from consumers
      this.consumers.forEach((consumer) => {
        const stats = consumer.getStats();
        if (stats && stats.rtt) {
          totalLatency += stats.rtt;
          count++;
        }
      });

      return count > 0 ? totalLatency / count : undefined;
    } catch (error) {
      console.error('Error calculating latency:', error);
      return undefined;
    }
  }

  /**
   * Handle consuming a producer
   * @param producerId - The ID of the producer to consume
   * @param producerPeerId - The ID of the peer that owns the producer
   * @param kind - The kind of producer (audio/video)
   * @param roomId - The ID of the room
   */
  private static async handleProducerConsumption(
    producerId: string,
    producerPeerId: string,
    kind: string,
    roomId: string
  ) {
    try {
      if (!this.receiveTransport) return;

      // Get RTP capabilities
      const rtpCapabilities = this.device?.rtpCapabilities;
      if (!rtpCapabilities) {
        throw new Error('Device not loaded with RTP capabilities');
      }

      // Create a consumer for the producer
      const response = await this.emitAsync<{
        error?: string;
        data?: {
          id: string;
          producerId: string;
          kind: 'audio' | 'video';
          rtpParameters: RtpParameters;
        };
      }>('consume', {
        roomId: roomId,
        userId: store.getState().auth.user?._id,
        producerId: producerId,
        rtpCapabilities: rtpCapabilities
      });

      if (response.error || !response.data) {
        throw new Error(response.error || 'No data received from consume request');
      }

      const consumer = await this.receiveTransport.consume({
        id: response.data.id,
        producerId: response.data.producerId,
        kind: response.data.kind,
        rtpParameters: response.data.rtpParameters
      });
      // Store the consumer
      store.dispatch(addConsumer({ id: consumer.id, consumer: consumer }));

      // Create a new MediaStream with the consumer's track
      const stream = new MediaStream([consumer.track]);

      store.dispatch(addRemoteStream({ userId: producerPeerId, stream: stream }));

      // Resume the consumer
      await this.emitAsync('resume_consumer', {
        roomId: roomId,
        userId: store.getState().auth.user?._id,
        consumerId: consumer.id
      });
    } catch (error) {
      console.error('Error handling producer consumption:', error);
    }
  }

  /**
   * Accept a call
   * @param roomId - The room ID
   * @param isVideo - Whether to include video in the call
   */
  public static async acceptCall(roomId: string, isVideo: boolean) {
    try {
      if (!this.socket) throw new Error('Socket not initialized');

      // Clean up any previous call state first
      await this.cleanupPreviousCall();

      // Create new device
      this.device = new Device();

      // Set up event listeners
      this.setupCommonEventListeners(roomId);

      // Get callLogId from Redux state
      const callLogId = store.getState().call.callLogId;

      // 1. Join room
      const response = await this.emitAsync<{
        data: {
          routerRtpCapabilities: any;
          transportOptions: {
            send: {
              id: string;
              iceParameters: IceParameters;
              iceCandidates: IceCandidate[];
              dtlsParameters: DtlsParameters;
            };
            receive: {
              id: string;
              iceParameters: IceParameters;
              iceCandidates: IceCandidate[];
              dtlsParameters: DtlsParameters;
            };
          };
        };
      }>('join_room', {
        roomId: roomId,
        userId: store.getState().auth.user?._id,
        userName: store.getState().auth.user?.username,
        callLogId: callLogId,
        deviceInfo: {
          browser: navigator.userAgent,
          os: navigator.platform,
          device: 'web'
        }
      });

      if (!this.device) {
        throw new Error('Device not initialized');
      }

      // Load the device with router RTP capabilities
      await this.device.load({ routerRtpCapabilities: response.data.routerRtpCapabilities });

      // Create send transport using options from join_room
      const { send, receive } = response.data.transportOptions;
      this.sendTransport = this.device.createSendTransport(send);
      this.receiveTransport = this.device.createRecvTransport(receive);

      // Set up transport event handlers
      this.setupTransportHandlers(roomId);

      // Force stop any existing tracks before requesting new ones
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.localStream = null;
      }

      // Clear any existing local stream in Redux
      store.dispatch(setLocalStream(null));

      // Request new media stream with a small delay to ensure previous streams are fully released
      await new Promise((resolve) => {
        return setTimeout(resolve, 100);
      });

      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: isVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 }
            }
          : false
      });

      if (!stream.active) {
        throw new Error('Failed to get active media stream');
      }

      this.localStream = stream;
      store.dispatch(setLocalStream(stream));

      // Notify that we're now in an ongoing call
      store.dispatch(setOngoingCall(true));

      // Publish local tracks first
      if (stream.getAudioTracks().length > 0) {
        const audioTrack = stream.getAudioTracks()[0];
        const audioProducer = await this.sendTransport?.produce({
          track: audioTrack,
          codecOptions: {
            opusStereo: true,
            opusDtx: true
          }
        });
        if (audioProducer) {
          store.dispatch(addProducer({ kind: 'audio', producer: audioProducer }));
        }
      }

      if (stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        const videoProducer = await this.sendTransport?.produce({
          track: videoTrack,
          codecOptions: {
            videoGoogleStartBitrate: 1000
          }
        });
        if (videoProducer) {
          store.dispatch(addProducer({ kind: 'video', producer: videoProducer }));
        }
      }

      // Get existing producers in the room
      const producersResponse = await this.emitAsync<{
        error?: string;
        data?: Array<{
          producerId: string;
          producerPeerId: string;
          kind: string;
        }>;
      }>('get_producer', {
        roomId: roomId,
        userId: store.getState().auth.user?._id
      });

      if (producersResponse.error) {
        throw new Error(producersResponse.error);
      }

      // Consume existing producers
      if (producersResponse.data) {
        for (const producer of producersResponse.data) {
          await this.handleProducerConsumption(
            producer.producerId,
            producer.producerPeerId,
            producer.kind,
            roomId
          );
        }
      }

      // Set up handler for new producers
      this.socket.on('new_producer', async ({ producerId, producerPeerId, kind }) => {
        if (producerPeerId === store.getState().auth.user?._id) return;
        await this.handleProducerConsumption(producerId, producerPeerId, kind, roomId);
      });
    } catch (error) {
      // If anything fails, ensure we clean up
      await this.cleanupPreviousCall();
      console.error('Error in acceptCall:', error);
      throw error;
    }
  }

  /**
   * Set up transport event handlers for both send and receive transports
   * @param roomId - The ID of the room
   */
  private static setupTransportHandlers(roomId: string) {
    // Handle send transport connection
    this.sendTransport?.on(
      'connect',
      async (
        { dtlsParameters }: { dtlsParameters: DtlsParameters },
        callback: () => void,
        errback: (error: Error) => void
      ) => {
        try {
          await this.emitAsync('connect_transport', {
            roomId: roomId,
            userId: store.getState().auth.user?._id,
            transportId: this.sendTransport!.id,
            dtlsParameters: dtlsParameters
          });
          callback();
        } catch (error) {
          errback(error as Error);
        }
      }
    );

    // Handle send transport production
    this.sendTransport?.on(
      'produce',
      async (
        { kind, rtpParameters }: { kind: 'audio' | 'video'; rtpParameters: RtpParameters },
        callback: (arg: { id: string }) => void,
        errback: (error: Error) => void
      ) => {
        try {
          const response = await this.emitAsync<{ id: string }>('produce', {
            roomId: roomId,
            userId: store.getState().auth.user?._id,
            transportId: this.sendTransport!.id,
            kind: kind,
            rtpParameters: rtpParameters
          });
          callback(response);
        } catch (error) {
          errback(error as Error);
        }
      }
    );

    // Handle receive transport connection
    this.receiveTransport?.on(
      'connect',
      async (
        { dtlsParameters }: { dtlsParameters: DtlsParameters },
        callback: () => void,
        errback: (error: Error) => void
      ) => {
        try {
          await this.emitAsync('connect_transport', {
            roomId: roomId,
            userId: store.getState().auth.user?._id,
            transportId: this.receiveTransport!.id,
            dtlsParameters: dtlsParameters
          });
          callback();
        } catch (error) {
          errback(error as Error);
        }
      }
    );
  }

  /**
   * Set up common event listeners for call
   * @param roomId - The room ID
   */
  private static setupCommonEventListeners(roomId: string) {
    if (!this.socket) return;

    // Listen for new producers
    this.socket.on('new_producer', async ({ producerId, producerPeerId, kind }) => {
      try {
        if (producerPeerId === store.getState().auth.user?._id) return;

        await this.handleProducerConsumption(producerId, producerPeerId, kind, roomId);
      } catch (error) {
        console.error('Error handling new producer:', error);
      }
    });

    // Listen for producer closed
    this.socket.on('producer_closed', ({ consumerId }) => {
      const consumer = store.getState().call.consumers[consumerId];
      if (consumer) {
        consumer.close();
        store.dispatch(removeConsumer(consumerId));
      }
    });

    // Listen for peer left
    this.socket.on('peer_left', ({ peerId, roomId }) => {
      const remoteStream = store.getState().call.remoteStreams[peerId];
      if (remoteStream) {
        remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
        });

        store.dispatch(addRemoteStream({ userId: peerId, stream: null }));
      }

      // Close and remove any consumers associated with this peer
      Object.entries(store.getState().call.consumers).forEach(
        ([consumerId, consumer]: [string, any]) => {
          if (consumer.producerPeerId === peerId) {
            consumer.close();
            store.dispatch(removeConsumer(consumerId));
          }
        }
      );
    });

    // Listen for call acceptance
    this.socket.on('call_accepted', async ({ roomId, userId, userName }) => {
      store.dispatch(setOngoingCall(true));

      // Add the user to participants if not already there
      // const participants = store.getState().call.participants;
      // if (!participants[userId]) {
      //   const updatedParticipants = {
      //     ...participants,
      //     [userId]: { id: userId, username: userName }
      //   };
      //   // We would need to update participants in Redux here if needed
      // }

      // If we have local stream, it means we have permissions already
      // So we can immediately try to get the remote streams
      if (store.getState().call.localStream) {
        try {
          // Refresh remote streams to ensure we get the stream from the user who just accepted
          await this.refreshRemoteStreams(roomId);
        } catch (error) {
          console.error('Error getting remote streams after call acceptance:', error);
        }
      }
    });

    // Listen for call status updates (busy, rejected, etc.)
    this.socket.on(CALL_STATUS_UPDATE, async ({ callLogId, userId, status }) => {
      // If the status is BUSY, end the call and show appropriate message
      if (status === 'busy') {
        // Get the username from participants
        const participants = store.getState().call.participants;
        const username = participants[userId]?.username || 'User';

        // Show notification that user is busy
        notification.info({
          message: 'Call Ended',
          description: `${username} is busy on another call`,
          placement: 'topRight'
        });

        // End the call automatically
        if (roomId) {
          await this.endCall(roomId);
        }
      }
    });
  }

  /**
   * Cleanup previous call
   */
  private static async cleanupPreviousCall() {
    try {
      // Remove socket listeners first to prevent any race conditions
      if (this.socket) {
        this.socket.off('new_producer');
        this.socket.off('producer_closed');
        this.socket.off('peer_left');
        this.socket.off('call_accepted');
      }

      // Stop all local media tracks
      if (this.localStream) {
        const tracks = this.localStream.getTracks();
        for (const track of tracks) {
          try {
            track.stop();
          } catch (error) {
            console.warn('Error stopping track:', error);
          }
        }
        this.localStream = null;
      }

      // Clear local stream in Redux
      store.dispatch(setLocalStream(null));

      // Clear remote streams in Redux
      const remoteStreams = store.getState().call.remoteStreams;
      Object.entries(remoteStreams).forEach(([userId, stream]) => {
        if (stream) {
          try {
            (stream as MediaStream).getTracks().forEach((track: MediaStreamTrack) => {
              track.stop();
            });
          } catch (error) {
            console.warn('Error stopping remote track:', error);
          }
          store.dispatch(addRemoteStream({ userId, stream: null }));
        }
      });

      // Close all producers with error handling
      for (const producer of this.producers.values()) {
        try {
          producer.close();
        } catch (error) {
          console.warn('Error closing producer:', error);
        }
      }
      this.producers.clear();

      // Close all consumers with error handling
      for (const consumer of this.consumers.values()) {
        try {
          consumer.close();
        } catch (error) {
          console.warn('Error closing consumer:', error);
        }
      }
      this.consumers.clear();

      // Close transports with error handling
      if (this.sendTransport) {
        try {
          this.sendTransport.close();
        } catch (error) {
          console.warn('Error closing send transport:', error);
        }
        this.sendTransport = null;
      }

      if (this.receiveTransport) {
        try {
          this.receiveTransport.close();
        } catch (error) {
          console.warn('Error closing receive transport:', error);
        }
        this.receiveTransport = null;
      }

      // Reset device handler
      if (this.device?.loaded) {
        try {
          this.device = null;
        } catch (error) {
          console.warn('Error resetting device:', error);
        }
      }

      // Reset connection state
      this.isConnected = false;
      this.roomId = null;
    } catch (error) {
      console.error('Error in cleanupPreviousCall:', error);
      // Continue with state reset even if cleanup fails
    }
  }

  /**
   * Refreshes remote streams by fetching and consuming existing producers in the room
   * This is used to ensure all remote streams are properly connected after permissions are granted
   * @param roomId - The room ID
   */
  public static async refreshRemoteStreams(roomId: string) {
    try {
      if (!this.socket || !this.device || !this.receiveTransport) {
        throw new Error('Call not properly initialized');
      }

      // Get existing producers in the room
      const producersResponse = await this.emitAsync<{
        error?: string;
        data?: Array<{
          producerId: string;
          producerPeerId: string;
          kind: string;
        }>;
      }>('get_producer', {
        roomId: roomId,
        userId: store.getState().auth.user?._id
      });

      if (producersResponse.error) {
        throw new Error(producersResponse.error);
      }

      // Consume existing producers
      if (producersResponse.data) {
        for (const producer of producersResponse.data) {
          // Skip if we're already consuming this producer
          if (this.consumers.has(producer.producerId)) {
            continue;
          }

          await this.handleProducerConsumption(
            producer.producerId,
            producer.producerPeerId,
            producer.kind,
            roomId
          );
        }
      }
    } catch (error) {
      console.error('Error refreshing remote streams:', error);
      throw error;
    }
  }
}

export default CallService;
