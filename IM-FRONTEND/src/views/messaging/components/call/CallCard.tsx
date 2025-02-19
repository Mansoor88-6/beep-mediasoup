import {
  AudioOutlined,
  CloseOutlined,
  PhoneOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  VideoCameraAddOutlined
} from '@ant-design/icons';
import React from 'react';
import { Avatar, Button } from 'antd';
import { ICallCardProps } from './types';
import { useSelector } from 'react-redux';
import { RootState } from 'appRedux/store';

/**
 * Call Card Design
 * @param {ICallCardProps} props = prm
 * @returns {React.FC} - returns
 */
const CallCard: React.FC<ICallCardProps> = (props: ICallCardProps) => {
  const callState = useSelector((state: RootState) => {
    return state.call;
  });

  // If we initiated the call, we'll have a record of calling this specific user
  const isIncomingCall = callState.isIncoming;

  return (
    <div className="max-w-[320px] cursor-pointer z-index-[100] overflow-hidden bg-white shadow-lg rounded-lg border border-gray-200">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-gray-100 p-4">
        <div className="flex items-center gap-3">
          <Avatar size={48} src="https://via.placeholder.com/48" alt="User Avatar" />
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">{props.remoteUsername}</h3>
            <p className="text-gray-500 text-sm">
              {!props.isOngoing ? (isIncomingCall ? 'Incoming call...' : 'Calling...') : 'On call'}
            </p>
          </div>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          className="text-red-500 hover:text-red-700"
          onClick={props.onReject}
        />
      </div>

      {/* Video Section */}
      <div className="relative w-full h-[240px] bg-black">
        {/* Show remote video only when call is connected */}
        {props.isVideo && props.isOngoing && (
          <video
            ref={props.remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Show local video whenever we have video enabled */}
        {props.isVideo && (
          <video
            ref={props.localVideoRef}
            autoPlay
            playsInline
            muted
            className={
              props.isOngoing
                ? 'absolute bottom-4 right-4 w-[80px] h-[60px] object-cover rounded-lg shadow-lg' // PiP when in call
                : 'absolute inset-0 w-full h-full object-cover' // Full size when setting up call
            }
          />
        )}
      </div>

      {/* Audio Element */}
      <audio ref={props.audioRef} autoPlay />

      {/* Actions Section */}
      <div className="flex flex-col items-center gap-4 py-3">
        <div className="text-xl font-bold text-green-600 capitalize">{props.remoteUsername}</div>

        {/* Call Controls */}
        <div className="flex items-baseline gap-4 mt-4">
          {!props.isOngoing ? (
            // Pre-call controls
            <>
              {/* Only show accept button for incoming calls */}
              {isIncomingCall && (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<PhoneOutlined />}
                  className="bg-green-500 hover:bg-green-600"
                  onClick={props.onAccept}
                />
              )}

              {/* Video toggle only for video calls */}
              {props.isVideo && (
                <Button
                  type={props.isVideoEnabled ? 'default' : 'primary'}
                  shape="circle"
                  icon={props.isVideoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
                  onClick={props.onToggleVideo}
                />
              )}

              {/* End call button */}
              <Button
                danger
                shape="circle"
                icon={<PhoneOutlined rotate={135} />}
                onClick={props.onReject}
              />
            </>
          ) : (
            // In-call controls
            <>
              <Button
                type={props.isMuted ? 'default' : 'primary'}
                shape="circle"
                icon={props.isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
                onClick={props.onToggleMute}
              />

              {props.isVideo && (
                <Button
                  type={props.isVideoEnabled ? 'default' : 'primary'}
                  shape="circle"
                  icon={props.isVideoEnabled ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
                  onClick={props.onToggleVideo}
                />
              )}

              <Button
                danger
                shape="circle"
                icon={<PhoneOutlined rotate={135} />}
                onClick={props.onReject}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallCard;
