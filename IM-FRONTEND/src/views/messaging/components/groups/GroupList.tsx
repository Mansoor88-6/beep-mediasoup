import React, { useMemo } from 'react';
import { ZERO } from 'constant';
import { IGroupListProps } from '../types';
import GroupListItem from './GroupListItem';
// Redus
import { useSelector } from 'react-redux';
import { RootState } from 'appRedux/store';
import { useSearch } from '../../context/SearchContext';
import { Skeletons } from 'components';

/**
 * Component that renders a list of group chats
 * @param {IGroupListProps} props - Component props
 * @returns {React.FC} Returns GroupList component
 */
const GroupList: React.FC<IGroupListProps> = ({ onGroupSelect }) => {
  const { chats, loading, activeChat } = useSelector((state: RootState) => {
    return state.messages;
  });
  const { filterChats } = useSearch();

  // Filter to show only group chats and apply search filter
  const filteredGroups = useMemo(() => {
    const groupChats = Object.values(chats).filter((chat) => {
      return chat.type === 'group';
    });
    return filterChats(groupChats);
  }, [chats, filterChats]);

  return (
    <div className="flex flex-col h-full">
      {/* <div className="py-2 border-b">
        <Button
          type="primary"
          icon={<UsergroupAddOutlined />}
          onClick={() => {
            return setIsModalVisible(true);
          }}
          className="w-full rounded-full bg-cyan-500 hover:bg-cyan-600">
          Create New Group
        </Button>
      </div> */}

      <div className="flex-1 overflow-y-auto">
        {loading && filteredGroups.length === ZERO ? (
          <Skeletons.ChatItemSkeleton />
        ) : filteredGroups.length > ZERO ? (
          filteredGroups.map((chat) => {
            return (
              <GroupListItem
                key={chat._id}
                chat={chat}
                onGroupSelect={onGroupSelect}
                isActive={chat._id === activeChat}
              />
            );
          })
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            {Object.keys(chats).length === 0 ? 'No groups available' : 'No matching groups found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupList;
