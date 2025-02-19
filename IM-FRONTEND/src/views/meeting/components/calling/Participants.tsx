import React from 'react';
import { IParticipantProps } from './types';
import { Avatar } from 'antd';

/**
 * Participants
 * @param {IParticipantProps} props - params
 * @returns {React.FC} - return
 */
const Participants: React.FC<IParticipantProps> = (props: IParticipantProps) => {
  return (
    <div className="px-4">
      {props.participants.map((participant) => {
        return (
          <div key={participant.id} className="flex items-center gap-3 py-2">
            {participant.avatar ? (
              <Avatar src={participant.avatar} />
            ) : (
              <Avatar className="bg-[#E5EFE9]">{participant.initials}</Avatar>
            )}
            <span>{participant.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Participants;
