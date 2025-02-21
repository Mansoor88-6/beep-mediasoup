/* eslint-disable no-console */
import React, { useRef, useEffect, useState } from 'react';
import { Modal, Tooltip } from 'antd';
import {
  PhoneOutlined,
  AudioMutedOutlined,
  AudioOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  UserOutlined,
  CheckCircleFilled,
  CloseCircleFilled
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'appRedux/store';
import { setOngoingCall } from 'appRedux/reducers/callReducer';
import CallService from 'services/CallService';
import AudioService from 'services/AudioService';

/**
 * Call Modal Component
 * @returns {React.FC} Component
 */
const CallModal: React.FC = () => {
  const dispatch = useDispatch();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const {
    isIncoming,
    isOngoing,
    roomId,
    isVideo,
    localStream,
    remoteStreams,
    participants,
    callerInfo
  } = useSelector((state: RootState) => {
    return state.call;
  });
  const user = useSelector((state: RootState) => {
    return state.auth.user;
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const remoteAudioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const attachAttemptRef = useRef<number>(0);

  // Effect for local video stream
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

    /**
     * Attach stream to video element
     */
    const attachStream = async () => {
      const videoElement = localVideoRef.current;

      if (!videoElement || !localStream || !isVideo) {
        return false;
      }

      try {
        if (videoElement.srcObject !== localStream) {

          videoElement.srcObject = localStream;
          await videoElement.play();

          return true;
        }
        return true;
      } catch (error) {
        console.error('Failed to attach stream:', error);
        return false;
      }
    };

    /**
     * Try to attach stream to video element
     */
    const tryAttachStream = async () => {
      if (await attachStream()) {
        attachAttemptRef.current = 0;
        return;
      }

      // If we haven't exceeded max attempts, try again
      if (attachAttemptRef.current < 5) {
        attachAttemptRef.current++;
        timeoutId = setTimeout(tryAttachStream, 200);
      } else {
        console.error('Failed to attach stream after maximum attempts');
        attachAttemptRef.current = 0;
      }
    };

    // Start attachment process
    tryAttachStream();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      attachAttemptRef.current = 0;
    };
  }, [localStream, isVideo]);

  // Handle remote streams
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      // Stop any playing sounds when we get a remote stream
      AudioService.stopAll();

      // Handle video
      const videoElement = remoteVideoRefs.current[userId];
      if (videoElement && stream) {
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          if (videoElement.srcObject !== stream) {
            videoElement.srcObject = stream;
            videoElement.play().catch((error) => {
              console.error('Failed to play remote video stream:', error);
            });
          }
        }
      }

      // Handle audio
      const audioElement = remoteAudioRefs.current[userId];
      if (audioElement && stream) {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          if (audioElement.srcObject !== stream) {
            audioElement.srcObject = stream;
            audioElement.play().catch((error) => {
              console.error('Failed to play remote audio stream:', error);
            });
          }
        }
      }
    });
  }, [remoteStreams]);

  // Handle call sounds
  useEffect(() => {
    // Initialize audio service when component mounts
    AudioService.initialize();

    const participantCount = Object.keys(participants).length;
    const hasParticipants = participantCount > 1;
    // Handle incoming call sound
    if (isIncoming && !isOngoing) {
      AudioService.playIncomingCall();
    }
    // Handle outgoing call sound
    else if (!isIncoming && isOngoing && !hasParticipants) {
      AudioService.playOutgoingCall();
    }
    // Stop all sounds when call becomes ongoing or component unmounts
    else if (hasParticipants) {
      AudioService.stopAll();
    }

    // Cleanup function to stop all sounds when component unmounts
    // or when call state changes
    return () => {
      AudioService.stopAll();
    };
  }, [isIncoming, isOngoing, participants]);

  /**
   * Handles accepting an incoming call
   */
  const handleAcceptCall = async () => {
    if (!roomId || !user) return;

    try {
      // Request media permissions first
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

      // Stop the incoming call sound
      AudioService.stopAll();

      // Accept the call only after we have media permissions
      await CallService.acceptCall(roomId, isVideo);
      dispatch(setOngoingCall(true));
    } catch (error) {
      console.error('Error accepting call:', error);

      // Handle permission denied error
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          // End the call since we can't proceed without permissions
          handleEndCall();
        } else {
          console.error('Unexpected error while accepting call:', error);
          handleEndCall();
        }
      }
    }
  };

  /**
   * Handles ending the current call
   */
  const handleEndCall = async () => {
    if (roomId) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      AudioService.playCallEnd();

      if (isIncoming && !isOngoing) {
        // If it's an incoming call that hasn't been answered yet, mark it as rejected
        await CallService.endCall(roomId, true);
      } else {
        await CallService.endCall(roomId);
      }
    }
  };

  // Effect to handle call timeout
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

    if (isIncoming && !isOngoing) {
      // If incoming call is not answered within 30 seconds, auto-reject it
      timeoutId = setTimeout(() => {
        if (roomId) {
          // handleEndCall();
          CallService.handleCallTimeout(roomId);
        }
      }, 30000); // 30 seconds
    } else if (!isIncoming && !isOngoing) {
      // If outgoing call is not answered within 30 seconds, mark it as missed
      timeoutId = setTimeout(() => {
        if (roomId) {
          CallService.handleCallTimeout(roomId);
        }
      }, 30000); // 30 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isIncoming, isOngoing, roomId]);

  /**
   * Handles toggling the audio track
   */
  const handleToggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  /**
   * Handles toggling the video track
   */
  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  /**
   * Get the modal width based on the number of video streams
   * @returns {number | string} Modal width in pixels or percentage
   */
  const getModalWidth = () => {
    if (!isVideo) return 500;

    const streamCount = Object.keys(remoteStreams).length;
    if (streamCount === 0) return 800;
    if (streamCount === 1) return 1000;
    return '90%';
  };

  if (!isIncoming && !isOngoing) return null;

  return (
    <Modal
      title={null}
      open={true}
      footer={null}
      closable={false}
      width={getModalWidth()}
      className="!bg-white !rounded-2xl !shadow-xl"
      centered>
      <div>
        {/* Call Header Information */}
        <div className="relative px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Call Status */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-600 text-sm font-medium">
                  {isIncoming ? 'Incoming Call' : 'Active Call'}
                </span>
              </div>

              {/* Call Type */}
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-sm">•</span>
                <span className="text-sm">{isVideo ? 'Video Call' : 'Audio Call'}</span>
              </div>
            </div>

            {/* Participants Count */}
            {isOngoing && (
              <div className="flex items-center gap-2">
                <Tooltip title="Participants in call">
                  <div className="flex items-center gap-2">
                    <UserOutlined className="text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {Object.keys(remoteStreams).length + 1}
                    </span>
                  </div>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Caller Info - Compact */}
          {callerInfo && (
            <div className="mt-2">
              <h3 className="text-lg font-medium text-gray-900">
                {callerInfo.isGroupCall ? callerInfo.groupName : ''}
              </h3>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="p-6 bg-gray-50 min-h-[400px]">
          {/* Video Grid */}
          {isVideo ? (
            <div>
              <div
                className={`grid ${
                  Object.keys(remoteStreams).length === 0
                    ? 'grid-cols-1'
                    : Object.keys(remoteStreams).length === 1
                    ? 'grid-cols-2'
                    : 'grid-cols-2 lg:grid-cols-3'
                } gap-4 mb-6`}>
                {/* Local Video */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">You</span>
                      <div className="flex gap-2">
                        <Tooltip title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
                          <button
                            className={`p-2 rounded-lg transition-all ${
                              isAudioEnabled
                                ? 'bg-white/20 hover:bg-white/30'
                                : 'bg-red-500 text-white'
                            }`}
                            onClick={handleToggleAudio}>
                            {isAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
                          </button>
                        </Tooltip>
                        <Tooltip title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
                          <button
                            className={`p-2 rounded-lg transition-all ${
                              isVideoEnabled
                                ? 'bg-white/20 hover:bg-white/30'
                                : 'bg-red-500 text-white'
                            }`}
                            onClick={handleToggleVideo}>
                            {isVideoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remote Videos */}
                {Object.entries(remoteStreams).map(([userId]) => {
                  const participant = participants[userId];
                  return (
                    <div
                      key={userId}
                      className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                      <video
                        ref={(el) => {
                          remoteVideoRefs.current[userId] = el;
                        }}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <audio
                        ref={(el) => {
                          remoteAudioRefs.current[userId] = el;
                        }}
                        autoPlay
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="text-sm font-medium text-white">
                          {participant?.username || 'Remote User'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Audio Call View */
            <div className="flex flex-col items-center justify-center h-full">
              {/* Add audio elements for remote streams */}
              {Object.entries(remoteStreams).map(([userId]) => {
                return (
                  <audio
                    key={userId}
                    ref={(el) => {
                      remoteAudioRefs.current[userId] = el;
                    }}
                    autoPlay
                  />
                );
              })}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
                {/* Show current user first */}
                {user && (
                  <div
                    key={user._id}
                    className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center">
                        <UserOutlined className="text-2xl text-gray-700" />
                      </div>
                      {/* Audio control for current user */}
                      <Tooltip title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
                        <button
                          onClick={handleToggleAudio}
                          className={`absolute -bottom-2 right-0 p-2 rounded-full transition-all ${
                            isAudioEnabled
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-red-500 hover:bg-red-600 text-white'
                          }`}>
                          {isAudioEnabled ? <AudioOutlined /> : <AudioMutedOutlined />}
                        </button>
                      </Tooltip>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.username} (You)</span>
                  </div>
                )}
                {/* Show only participants who have active streams */}
                {Object.entries(remoteStreams).map(([userId, stream]) => {
                  const participant = participants[userId];
                  if (!participant || !stream) return null;

                  return (
                    <div
                      key={userId}
                      className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center">
                          <UserOutlined className="text-2xl text-gray-700" />
                        </div>
                        {/* Show mute status for remote participants */}
                        {stream.getAudioTracks()[0]?.enabled === false && (
                          <div className="absolute -bottom-2 right-0 p-2 rounded-full bg-red-500 text-white">
                            <AudioMutedOutlined />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {participant.username}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Call Controls - Always at bottom of content area */}
          {isOngoing && !isIncoming && (
            <div className="flex justify-center mt-6">
              <button
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-colors text-white"
                onClick={handleEndCall}>
                <PhoneOutlined rotate={135} />
                <span>Leave Call</span>
              </button>
            </div>
          )}
        </div>

        {/* Incoming Call Actions */}
        {isIncoming && (
          <div className="border-t border-gray-100 p-6">
            <div className="flex justify-center gap-4">
              <button
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-500 hover:bg-green-600 transition-colors text-white"
                onClick={handleAcceptCall}>
                <CheckCircleFilled />
                <span>Accept</span>
              </button>
              <button
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-colors text-white"
                onClick={handleEndCall}>
                <CloseCircleFilled />
                <span>Decline</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CallModal;
