import React from 'react';
import { Card, Button, Typography, Tooltip, Avatar } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  VideoCameraOutlined,
  LockOutlined,
  EditOutlined
} from '@ant-design/icons';
import { IRoomCardProps } from './types';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

/**
 * Room Card Component
 * @param {IRoomCardProps} props - prm
 * @returns {React.FC} - return
 */
const RoomCard: React.FC<IRoomCardProps> = (props: IRoomCardProps) => {
  const navigate = useNavigate();
  const {
    // _id,
    title,
    date,
    time,
    icon,
    participants,
    joinParticipants,
    hostname,
    color,
    roomCode,
    isPrivate,
    onEditButton
  } = props;
  return (
    <Card
      className={`relative w-50 h-70 overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 group`}
      bodyStyle={{ padding: 0 }}>
      <div className={`h-1/2 ${color} relative overflow-hidden`}>
        <Avatar
          alt={title}
          icon={icon || <UserOutlined />}
          className="h-20 w-10 object-cover mix-blend-overlay opacity-50"
        />
        <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center">
          <VideoCameraOutlined className="text-6xl text-white" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20" />
        <div className="absolute bottom-3 left-3 right-3">
          {isPrivate && (
            <Tooltip title="Private Room">
              <LockOutlined className="text-gray-500" />
            </Tooltip>
          )}
        </div>
        {/* Edit Button shown on hover */}
        <Tooltip title="Edit Room">
          <Button
            size="small"
            type="link"
            shape="circle"
            icon={<EditOutlined />}
            onClick={onEditButton}
            className="absolute top-2 right-2 items-center justify-center text-green bg-white bg-opacity-75 hover:bg-opacity-90 hidden group-hover:flex transition-all"
          />
        </Tooltip>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <Title level={5} className="text-lg font-bold text-white" ellipsis={{ tooltip: title }}>
          {title}
        </Title>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gray-600">
            <CalendarOutlined className="text-xs" />
            <Text className="text-xs">{date}</Text>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <ClockCircleOutlined className="text-xs" />
            <Text className="text-xs">{time}</Text>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Tooltip title={`Host: ${hostname}`}>
            <div className="flex items-center gap-2">
              <Avatar size="small" icon={<UserOutlined />} className={`${color} text-white`} />
              <Text className="text-xs text-gray-600 truncate max-w-[100px]">{hostname}</Text>
            </div>
          </Tooltip>
          <Tooltip title={`${participants}/${joinParticipants} participants`}>
            <div className="flex items-center gap-1">
              <UserOutlined className="text-xs text-gray-500" />
              <Text className="text-xs text-gray-600">
                {participants}/{joinParticipants}
              </Text>
            </div>
          </Tooltip>
        </div>
        <Button
          type="primary"
          onClick={() => {
            return navigate(`/vc/${roomCode}`);
          }}
          className={`mt-2 w-full ${color} border-none hover:opacity-90 text-white font-semibold`}
          icon={<VideoCameraOutlined />}>
          Join Room
        </Button>
      </div>
    </Card>
  );
};

export default RoomCard;
