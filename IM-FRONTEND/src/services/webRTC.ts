/* eslint-disable no-console */
import { ZERO } from 'constant';
import AudioService from './Audio';
import AudioFile from 'assets/tones/ringtone.mp3';
// Redux
import store from 'appRedux/store';
import * as events from 'appRedux/middleware/socket/events';
// import { setOutgoingCall } from 'appRedux/reducers/callReducer';
import Socket from 'appRedux/middleware/socket/socketMiddleware';

type NewType = (stream: MediaStream) => void;

/**
 * WebRTCService class for handling WebRTC connections and calls.
 */
export default class WebRTCService {
  private static peerConnection: RTCPeerConnection | null = null;
  private static pendingCandidates: RTCIceCandidate[] = [];
  private static onRemoteStream: ((stream: MediaStream) => void) | null = null;
  private static localStream: MediaStream | null = null;
  public static isVideoCall: boolean = false;
  public static audioService: AudioService = new AudioService(AudioFile);

  /**
   * Initializes the peer connection.
   */
  private static initializePeerConnection() {
    if (WebRTCService.peerConnection) {
      WebRTCService.peerConnection.close();
    }

    WebRTCService.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: 'turn:numb.viagenie.ca',
          username: 'webrtc@live.com',
          credential: 'muazkh'
        }
      ],
      iceCandidatePoolSize: 10
    });

    // Handle incoming tracks
    WebRTCService.peerConnection.ontrack = (event) => {
      console.log('Received track:', event.track.kind, 'enabled:', event.track.enabled);
      const [remoteStream] = event.streams;
      WebRTCService.audioService.stop();
      if (remoteStream && WebRTCService.onRemoteStream) {
        // console.log('Setting remote stream with tracks:', {
        //   audio: remoteStream.getAudioTracks().length,
        //   video: remoteStream.getVideoTracks().length,
        //   videoEnabled: remoteStream.getVideoTracks().map((track) => {
        //     return track.enabled;
        //   })
        // });

        // Ensure video tracks are enabled if they exist
        remoteStream.getVideoTracks().forEach((track) => {
          track.enabled = true;
        });

        WebRTCService.onRemoteStream(remoteStream);
      }
    };

    // Connection state monitoring
    WebRTCService.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', WebRTCService.peerConnection?.connectionState);
    };

    WebRTCService.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', WebRTCService.peerConnection?.iceConnectionState);
    };

    WebRTCService.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Socket.socketEmit(events.ICE_CANDIDATE, {
        //   candidate: event.candidate
        // });
      }
    };
  }

  /**
   * Starts a call to a remote user.
   * @param {string} remoteUserId - The ID of the remote user.
   * @param {string} remoteUsername - The username of the remote user.
   * @param {boolean} withVideo - The withVideo of the remote user.
   */
  public static async startCall(
    remoteUserId: string,
    remoteUsername: string,
    withVideo: boolean = false
  ): Promise<void> {
    try {
      WebRTCService.isVideoCall = withVideo;

      // Create and play a ringing sound
      WebRTCService.audioService.start();

      // Get local media stream BEFORE creating peer connection
      WebRTCService.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: withVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          : false
      });

      console.log('Got local stream:', {
        audioTracks: WebRTCService.localStream.getAudioTracks().length,
        videoTracks: WebRTCService.localStream.getVideoTracks().length
      });

      // Initialize peer connection AFTER getting stream
      WebRTCService.initializePeerConnection();

      // Add tracks to peer connection
      WebRTCService.localStream.getTracks().forEach((track) => {
        console.log('Adding track to peer connection:', track.kind);
        WebRTCService.peerConnection?.addTrack(track, WebRTCService.localStream!);
      });

      const offer = await WebRTCService.peerConnection?.createOffer();
      console.log('Created offer:', offer);
      await WebRTCService.peerConnection?.setLocalDescription(offer);

      // store.dispatch(
      //   // setOutgoingCall({
      //   //   userId: remoteUserId,
      //   //   username: remoteUsername,
      //   //   isVideo: withVideo
      //   // })
      // );

      // await Socket.socketEmit(events.CALL_USER, {
      //   userId: remoteUserId,
      //   username: store.getState().auth.user?.username,
      //   offer: offer,
      //   isVideo: withVideo
      // });

      WebRTCService.audioService.stop();
    } catch (error) {
      console.error('Error starting video call:', error);
      WebRTCService.audioService.stop();
      throw error;
    }
  }

  /**
   * Handles an incoming call from a remote user.
   * @param {RTCSessionDescriptionInit} offer - offer
   * @param {boolean} isVideo - boolean.
   * @returns {Promise<RTCSessionDescriptionInit | undefined>} - returns
   */
  public static async handleIncomingCall(
    offer: RTCSessionDescriptionInit,
    isVideo: boolean = false
  ): Promise<RTCSessionDescriptionInit | undefined> {
    try {
      console.log('Handling incoming call with video:', isVideo);
      WebRTCService.isVideoCall = isVideo;

      try {
        // Try to get media stream first
        WebRTCService.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            : false
        });
      } catch (mediaError) {
        // Fall back to audio only if video fails
        WebRTCService.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
      }

      // Initialize peer connection after getting stream
      WebRTCService.initializePeerConnection();

      // Add tracks
      WebRTCService.localStream.getTracks().forEach((track) => {
        WebRTCService.peerConnection?.addTrack(track, WebRTCService.localStream!);
      });

      await WebRTCService.peerConnection?.setRemoteDescription(new RTCSessionDescription(offer));

      // Add any pending ICE candidates after remote description is set
      await WebRTCService.addPendingCandidates();

      const answer = await WebRTCService.peerConnection?.createAnswer();

      await WebRTCService.peerConnection?.setLocalDescription(answer);

      return answer;
    } catch (error) {
      console.error('Error handling incoming call:', error);
      throw error;
    }
  }

  /**
   * Handles an incoming ICE candidate from a remote user.
   * @param {RTCIceCandidate} candidate - The ICE candidate received from the remote user.
   * @returns {Promise<void>} - return
   */
  public static async handleIceCandidate(candidate: RTCIceCandidate) {
    try {
      console.log('Handling ICE candidate:', candidate.candidate);
      if (WebRTCService.peerConnection?.remoteDescription) {
        await WebRTCService.peerConnection.addIceCandidate(candidate);
      } else {
        WebRTCService.pendingCandidates.push(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  /**
   * Adds any pending ICE candidates that were received before the remote description was set.
   * This is called after setting the remote description to ensure all candidates are added.
   */
  private static async addPendingCandidates() {
    while (WebRTCService.pendingCandidates.length > ZERO) {
      const candidate = WebRTCService.pendingCandidates.shift();
      if (candidate) {
        try {
          await WebRTCService.peerConnection?.addIceCandidate(candidate);
          console.log('Added pending ICE candidate');
        } catch (error) {
          console.error('Error adding pending ICE candidate:', error);
        }
      }
    }
  }

  /**
   * Sets the callback for handling remote stream.
   * @param {NewType} callback - The callback function.
   */
  setOnRemoteStream(callback: (stream: MediaStream) => void) {
    WebRTCService.onRemoteStream = callback;
  }

  /**
   * Ends the current call.
   */
  public static endCall() {
    WebRTCService.audioService.stop();
    WebRTCService.localStream?.getTracks().forEach((track) => {
      return track.stop();
    });
    WebRTCService.peerConnection?.close();
    WebRTCService.initializePeerConnection();
  }

  /**
   * Gets the peer connection.
   * @returns { RTCPeerConnection | null} The peer connection.
   */
  public static getPeerConnection(): RTCPeerConnection | null {
    return WebRTCService.peerConnection;
  }

  /**
   * Gets the local stream.
   * @returns {MediaStream | null} The local stream.
   */
  public static getLocalStream(): MediaStream | null {
    return WebRTCService.localStream;
  }

  /**
   * Sets the callback for handling remote stream.
   * @param {NewType} callback - The callback function.
   */
  public static setOnRemoteStream(callback: (stream: MediaStream) => void) {
    WebRTCService.onRemoteStream = callback;
  }

  /**
   * Enables the local audio stream.
   */
  public static enableLocalAudio() {
    WebRTCService.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
  }

  /**
   * Checks if video is enabled.
   * @returns {boolean} True if video is enabled, false otherwise.
   */
  public static isVideoEnabled(): boolean {
    return WebRTCService.isVideoCall;
  }
}
