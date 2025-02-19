import { Skeleton, Space } from 'antd';
import React from 'react';

/**
 * Render Chat Item Skeleton
 * @returns {React.FC} - return
 */
export const ChatItemSkeleton = () => {
  return (
    <div className={`flex items-center gap-3 p-2 my-1 bg-gray-100 rounded-lg cursor-pointer }`}>
      <Skeleton.Avatar active shape="circle" />
      <Space>
        <Skeleton.Input active size="small" block />
      </Space>
    </div>
  );
};
