import React, { useState } from 'react';
import { Layout, Button, Image } from 'antd';
import { Video, Mic, Share2, MoreHorizontal, Hand, MessageSquare, Users, X } from 'lucide-react';
import { IParticipant } from './types';
import { ScalableSegment } from 'components';
import Participants from './Participants';
import Chats from './Chats';
import { MessageOutlined, UsergroupAddOutlined } from '@ant-design/icons';

const { Content, Sider, Footer } = Layout;

/**
 * Calling Components
 * @returns {React.FC} - return
 */
const Calling = () => {
  const dummyImage =
    'https://cdn.pixabay.com/photo/2015/04/23/22/00/new-year-background-736885_1280.jpg';
  const [participants] = useState<IParticipant[]>([
    {
      id: '1',
      name: 'John Doe',
      avatar: dummyImage
    },
    { id: '2', name: 'Jane Smith', avatar: dummyImage },
    { id: '3', name: 'Alex Parker', initials: 'AP' },
    { id: '4', name: 'Sarah Wilson', avatar: dummyImage },
    { id: '5', name: 'Mike Johnson', avatar: dummyImage },
    { id: '6', name: 'Julia Park', initials: 'JP' },
    { id: '7', name: 'Kate Anderson', initials: 'KA' },
    { id: '8', name: 'Tom Brown', avatar: dummyImage }
  ]);

  const [pinnedParticipant] = useState<string | null>('1');
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <Layout className="h-screen p-4 bg-white overflow-hidden">
      <Content className="px-2 bg-white">
        <div className="grid gap-2">
          {/* Pinned Participant */}
          {pinnedParticipant && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              {participants.find((p) => {
                return p.id === pinnedParticipant;
              })?.avatar ? (
                <Image
                  src={
                    participants.find((p) => {
                      return p.id === pinnedParticipant;
                    })?.avatar
                  }
                  preview={false}
                  alt="pin-image"
                  className="w-full h-full border-2 border-green-600 bg-green-800 rounded-md bg-no-repeat"
                />
              ) : (
                <div className="w-full h-full flex items-center rounded-sm justify-center bg-blue-500">
                  <span className="text-4xl text-white">
                    {
                      participants.find((p) => {
                        return p.id === pinnedParticipant;
                      })?.initials
                    }
                  </span>
                </div>
              )}
              <div className="absolute bg-green-800 px-2 rounded-sm bottom-0 left-0 text-white flex items-center gap-2">
                <span className="">
                  {
                    participants.find((p) => {
                      return p.id === pinnedParticipant;
                    })?.name
                  }
                </span>
              </div>
            </div>
          )}

          {/* Participant Grid */}
          {/* <div
              className={`grid gap-4 overflow-y-scroll ${
                pinnedParticipant
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
              {participants
                .filter((p) => {
                  return p.id !== pinnedParticipant;
                })
                .map((participant) => {
                  return (
                    <div
                      key={participant.id}
                      className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
                      onClick={() => {
                        return setPinnedParticipant(participant.id);
                      }}>
                      {participant.avatar ? (
                        <Image
                          alt="user"
                          preview={false}
                          src={participant.avatar}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-500">
                          <span className="text-xl text-white">{participant.initials}</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 text-white text-sm flex items-center gap-2">
                        <Badge status="success" />
                        <span>{participant.name}</span>
                      </div>
                    </div>
                  );
                })}
            </div> */}
        </div>
      </Content>

      {/* Sidebar */}
      {showSidebar && (
        <Sider
          width={320}
          className="h-[calc(100vh-71px)] bg-white border-2 rounded-lg border-[#53C448] shadow-lg"
          breakpoint="lg"
          collapsedWidth={0}
          style={{ background: 'none' }}
          onCollapse={(collapsed) => {
            return setShowSidebar(!collapsed);
          }}>
          <div className="flex-none px-4 pt-4">
            <ScalableSegment
              block
              className="rounded-full bg-[#CEF6DB]"
              options={[
                {
                  label: 'Chats',
                  value: 'Chats',
                  icon: <MessageOutlined />,
                  content: <Chats />
                },
                {
                  label: 'participants',
                  value: 'participants',
                  icon: <UsergroupAddOutlined />,
                  content: <Participants participants={participants} />
                }
              ]}
            />
          </div>
        </Sider>
      )}

      {/* Bottom Controls */}
      <Footer className="fixed bottom-0 left-0 right-0 p-2 m-0 bg-white">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-600">08:53 | Recording</div>

          <div className="flex items-center gap-2">
            <Button
              type="primary"
              icon={<Video className="w-4 h-4 mt-1" />}
              className="bg-blue-500"
            />
            <Button
              type="primary"
              icon={<Mic className="w-4 h-4 mt-1" />}
              className="bg-blue-500"
            />
            <Button icon={<Share2 className="w-4 h-4 mt-1" />} />
            <Button icon={<Hand className="w-4 h-4 mt-1" />} />
            <Button
              icon={<MessageSquare className="w-4 h-4 mt-1" />}
              onClick={() => {
                return setShowSidebar(!showSidebar);
              }}
            />
            <Button icon={<MoreHorizontal className="w-4 h-4 mt-1" />} />
            <Button danger icon={<X className="w-4 h-4 mt-1" />} />
          </div>

          <Button
            icon={<Users className="w-4 h-4 mt-1" />}
            onClick={() => {
              return setShowSidebar(!showSidebar);
            }}>
            {participants.length}
          </Button>
        </div>
      </Footer>
    </Layout>
  );
};

export default Calling;
