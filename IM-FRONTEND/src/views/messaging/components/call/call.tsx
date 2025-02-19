import { Empty, List, Avatar, Spin, Button, Tooltip } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CallLogsSelector, AuthSelector } from 'appRedux/reducers';
import { fetchCallLogs } from 'appRedux/actions/callLogsAction';
import { CallStatus, CallType, ICallLog, ICallParticipant } from 'types/ReduxTypes/callLogs';
import {
  PhoneOutlined,
  VideoCameraOutlined,
  UserOutlined,
  ReloadOutlined,
  TeamOutlined
  // UserSwitchOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';

interface ChatInfo {
  id: string;
  name?: string;
  type: 'group' | 'individual';
  participant?: {
    _id: string;
    username: string;
    avatar?: string;
  };
}

interface CallLogWithChat extends ICallLog {
  chatInfo: ChatInfo;
}

interface UserInfo {
  _id: string;
  username: string;
  avatar?: string;
}

/**
 * Call History component that displays a list of all call logs
 * @returns {React.FC} Component
 */
const Calls: React.FC = () => {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector(CallLogsSelector);
  const { user } = useSelector(AuthSelector);

  useEffect(() => {
    // Only fetch if user exists and we haven't tried fetching yet
    if (user?._id && !loading && !error) {
      dispatch(fetchCallLogs());
    }
  }, [dispatch, user?._id]);

  /**
   * Get the appropriate call icon based on call type and status
   * @param callType - The type of call (audio/video)
   * @param status - The status of the call
   * @param isInitiator - Whether the current user initiated the call
   * @returns Icon component
   */
  const getCallIcon = (
    callType: CallType,
    status: CallStatus,
    isInitiator: boolean
  ): React.ReactElement => {
    const IconComponent = callType === CallType.VIDEO ? VideoCameraOutlined : PhoneOutlined;
    const rotation = isInitiator ? 0 : 180; // Rotate for incoming calls

    let colorClass = 'text-gray-400'; // Default color

    switch (status) {
      case CallStatus.MISSED:
      case CallStatus.REJECTED:
      case CallStatus.UNANSWERED:
        colorClass = 'text-red-500';
        break;
      case CallStatus.COMPLETED:
        colorClass = 'text-green-500';
        break;
      case CallStatus.ACCEPTED:
        colorClass = 'text-blue-500';
        break;
      case CallStatus.BUSY:
        colorClass = 'text-orange-500';
        break;
      default:
        colorClass = 'text-gray-400';
    }

    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <IconComponent
          className="text-lg"
          style={{
            transform: `rotate(${rotation}deg)`,
            display: 'inline-flex'
          }}
        />
      </div>
    );
  };

  /**
   * Get the appropriate status text based on call status and initiator
   * @param status - The status of the call
   * @param isInitiator - Whether the current user initiated the call
   * @returns {string} Status text
   */
  const getCallStatusText = (status: CallStatus, isInitiator: boolean): string => {
    switch (status) {
      case CallStatus.MISSED:
        return isInitiator ? 'No answer' : 'Missed';
      case CallStatus.REJECTED:
        return 'Declined';
      case CallStatus.COMPLETED:
        return ''; // We'll show duration instead
      case CallStatus.UNANSWERED:
        return isInitiator ? 'Cancelled' : 'Missed';
      case CallStatus.BUSY:
        return 'Busy';
      case CallStatus.ACCEPTED:
        return 'Ongoing';
      case CallStatus.LEFT:
        return 'Ended'; // Changed from 'Left the call'
      default:
        return '';
    }
  };

  /**
   * Get the quality text for a call
   * @param quality - The quality of the call
   * @returns The quality text
   */
  const getCallQualityText = (quality?: ICallLog['quality']): string | null => {
    if (!quality) return null;

    if (quality.packetLoss && quality.packetLoss > 10) {
      return 'Poor connection';
    }
    if (quality.latency && quality.latency > 300) {
      return 'High latency';
    }
    return null;
  };

  /**
   * Get the duration of a call in minutes and seconds
   * @param duration - The duration of the call in seconds
   * @returns The duration in minutes and seconds
   */
  const getCallDuration = (duration: number): string => {
    if (duration < 60) {
      return `${duration} sec`;
    }
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Get the initiator's username from the call log
   * @param log - The call log
   * @returns The initiator's username
   */
  const getInitiatorName = (log: CallLogWithChat): string => {
    const initiator = log.participants?.find((p: ICallParticipant) => {
      return p.role === 'initiator';
    });
    if (!initiator) return 'Unknown';
    return typeof initiator.userId === 'object'
      ? (initiator.userId as UserInfo)?.username
      : 'Unknown';
  };

  /**
   * Get the display name for the call log entry
   * @param log - The call log with chat info
   * @returns The display name
   */
  const getDisplayName = (log: CallLogWithChat): string => {
    if (log.chatInfo.type === 'group') {
      return log.chatInfo.name || 'Unnamed Group';
    }
    return log.chatInfo.participant?.username || 'Unknown User';
  };

  // /**
  //  * Get the subtitle for group calls
  //  * @param log - The call log
  //  * @param isInitiator - Whether the current user initiated the call
  //  * @returns The subtitle text
  //  */
  // const getGroupSubtitle = (log: CallLogWithChat, isInitiator: boolean): string => {
  //   if (isInitiator) {
  //     return 'You started a group call';
  //   }
  //   return `${getInitiatorName(log)} started a group call`;
  // };

  if (error) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error}</div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => {
            dispatch(fetchCallLogs());
          }}>
          Retry
        </Button>
      </div>
    );
  }

  if (loading && !logs.length) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">No call history</span>}
        />
      </div>
    );
  }

  return (
    <div className="h-[80vh] flex flex-col bg-white">
      <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Call History</h2>
        <Button
          type="text"
          icon={<ReloadOutlined spin={loading} />}
          onClick={() => {
            dispatch(fetchCallLogs());
          }}
          loading={loading}
        />
      </div>

      <div className="flex-1 overflow-y-auto call-logs-scroll">
        <List
          className="call-logs-list"
          dataSource={logs as CallLogWithChat[]}
          renderItem={(log) => {
            const isInitiator = log.participants.find((p: ICallParticipant) => {
              const participantId =
                typeof p.userId === 'object' ? (p.userId as UserInfo)?._id : p.userId;
              return participantId === user?._id && p.role === 'initiator';
            });
            const status =
              log.participants.find((p: ICallParticipant) => {
                const participantId =
                  typeof p.userId === 'object' ? (p.userId as UserInfo)?._id : p.userId;
                return participantId !== user?._id;
              })?.status || log.participants[0].status;

            const isFailedCall = status === CallStatus.MISSED || status === CallStatus.REJECTED;

            return (
              <List.Item
                className="px-6 py-3 hover:bg-gray-50 cursor-pointer border-b transition-colors"
                key={log._id}>
                <div className="flex items-center w-full gap-4">
                  <div className="flex-shrink-0 relative">
                    <Avatar
                      size={44}
                      icon={log.chatInfo.type === 'group' ? <TeamOutlined /> : <UserOutlined />}
                      className={`${
                        log.chatInfo.type === 'group' ? 'bg-green-50' : 'bg-blue-50'
                      } flex items-center justify-center`}
                    />
                    {log.callType === CallType.VIDEO && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <VideoCameraOutlined
                          className={
                            status === CallStatus.COMPLETED
                              ? 'text-green-500'
                              : isFailedCall
                              ? 'text-red-500'
                              : 'text-blue-500'
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`font-medium ${
                            isFailedCall ? 'text-red-500' : 'text-gray-900'
                          }`}>
                          {getDisplayName(log)}
                        </span>
                        {log.chatInfo.type === 'group' && (
                          <Tooltip title="Group Call">
                            <TeamOutlined className="text-gray-400 flex-shrink-0" />
                          </Tooltip>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex-shrink-0">
                        {formatDistanceToNow(new Date(log.startTime), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getCallIcon(log.callType, status as CallStatus, Boolean(isInitiator))}
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                isFailedCall ? 'text-red-500' : 'text-gray-500'
                              }`}>
                              <span
                                className={`${
                                  status === CallStatus.COMPLETED
                                    ? 'text-green-500'
                                    : status === CallStatus.MISSED || status === CallStatus.REJECTED
                                    ? 'text-red-500'
                                    : 'text-gray-500'
                                }`}>
                                {isInitiator ? '→' : status === CallStatus.MISSED ? '←' : '←'}
                              </span>{' '}
                              {getCallStatusText(status as CallStatus, Boolean(isInitiator))}
                            </span>
                            {status === CallStatus.COMPLETED && log.duration && (
                              <span className="text-sm text-gray-500">
                                • {getCallDuration(log.duration)}
                              </span>
                            )}
                            {status === CallStatus.COMPLETED && log.quality && (
                              <span className="text-xs text-orange-500">
                                {getCallQualityText(log.quality)}
                              </span>
                            )}
                          </div>
                          {log.metadata?.callEndReason && status !== CallStatus.COMPLETED && (
                            <span className="text-xs text-gray-400">
                              {log.metadata.callEndReason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {log.chatInfo.type === 'group' && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {isInitiator
                          ? 'You started a group call'
                          : `${getInitiatorName(log)} started a group call`}
                      </div>
                    )}
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      </div>

      <style>
        {`
          .call-logs-scroll::-webkit-scrollbar {
            width: 4px;
          }
          
          .call-logs-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .call-logs-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 20px;
          }
          
          .call-logs-scroll::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
          
          .call-logs-scroll {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db transparent;
          }

          .ant-list-item {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        `}
      </style>
    </div>
  );
};

export default Calls;
