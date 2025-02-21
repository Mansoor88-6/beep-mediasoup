import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  Layout,
  Input,
  Avatar,
  Button,
  Grid,
  Dropdown,
  Tooltip,
  Form,
  FloatButton,
  Row,
  Col,
  Typography,
  Divider,
  Upload,
  Popover,
  message
} from 'antd';
import {
  SearchOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  MoreOutlined,
  PlusOutlined,
  LockFilled,
  UserOutlined,
  MessageOutlined,
  SendOutlined,
  UsergroupAddOutlined,
  SettingFilled,
  FileImageOutlined,
  FileOutlined,
  AudioOutlined,
  VideoCameraFilled
} from '@ant-design/icons';
import Message from './components/chats/Message';
import ChatBgImg from 'assets/imgs/chat-bg.png';
import { useAppDispatch } from 'appRedux/store';
import { ScalableInput, ScalableSegment } from 'components';
import Chats from './components/chats/Chats';
import { useSelector } from 'react-redux';
import {
  sendMessage,
  fetchChatMessages,
  fetchAvailableParticipants,
  createChat,
  fetchChats,
  acknowledgeMessages
} from 'appRedux/actions/messageAction';
import { setActiveChat } from 'appRedux/reducers/messageReducer';
import { AuthSelector, MessageSelector, RootState } from 'appRedux/reducers';
import NewChatDropdown from './components/NewChatDropdown';
import Groups from './components/groups/GroupList';
import CallModal from './components/call/CallModal';
import { FOUR, THREE, ZERO } from 'constant';
import NewGroupModal from './components/groups/NewGroupModal';
import { Home, MessagesSquare } from 'lucide-react';
import { ProfileNav } from 'shared';
import Calls from './components/call/call';
import { setCallRoom } from 'appRedux/reducers/callReducer';
import CallService from 'services/CallService';
import MediaMessage from './components/media/MediaMessage';
import type { UploadFile } from 'antd/es/upload/interface';
import VoiceRecorder from './components/media/VoiceRecorder';
import type { RcFile } from 'antd/es/upload';
import { SearchProvider, useSearch } from './context/SearchContext';
import OnlineStatusAvatar from 'components/common/OnlineStatusAvatar';
import { resetUnreadCount } from 'appRedux/reducers/messageReducer';

// Media upload constants
export const MAX_IMAGE_SIZE = 16 * 1024 * 1024; // 16MB
export const MAX_VIDEO_SIZE = 128 * 1024 * 1024; // 128MB
export const MAX_DOC_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;
const { TextArea } = Input;

/**
 * SearchInput component for filtering chats
 * @param {object} props - Component props
 * @param {Function} props.onNewChat - Callback for creating new chat
 * @param {Function} props.onOpenGroupModal - Callback for opening group modal
 */
const SearchInput: React.FC<{
  onNewChat: (userId: string) => void;
  onOpenGroupModal: () => void;
}> = ({ onNewChat, onOpenGroupModal }) => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [debouncedValue, setDebouncedValue] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(debouncedValue);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [debouncedValue, setSearchQuery]);

  /**
   * Handles input change event
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedValue(e.target.value);
  };

  return (
    <ScalableInput
      placeholder="Search"
      style={{ background: 'transparent' }}
      className="border-0 hover:border-none hover:border-gray-200 ring-0"
      prefix={<SearchOutlined style={{ fontSize: 20 }} className="text-gray-400" />}
      value={debouncedValue}
      onChange={handleChange}
      suffix={
        <Dropdown
          overlay={
            <NewChatDropdown onUserSelect={onNewChat} setGroupModalVisible={onOpenGroupModal} />
          }
          trigger={['hover']}
          placement="bottomRight">
          <PlusOutlined
            style={{ fontSize: 20 }}
            className="text-gray-400 cursor-pointer hover:text-green-600 hover:rotate-90 transition-transform duration-300 ease-in-out"
          />
        </Dropdown>
      }
    />
  );
};

/**
 * Generates a thumbnail for a video file
 * @param {File} file - The video file to generate a thumbnail for
 * @returns {Promise<string>} - The thumbnail as a data URL
 */
const generateThumbnail = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      video.currentTime = 1; // Get thumbnail from first second
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL());
    };
  });
};

/**
 * MessageInputForm component for handling message input and sending
 */
const MessageInputForm = memo(
  ({
    onSendMessage,
    onStartVoiceRecord,
    onMediaUpload
  }: {
    onSendMessage: (text: string) => void;
    onStartVoiceRecord: () => void;
    onMediaUpload: (files: UploadFile[], type: 'image' | 'video' | 'document' | 'voice') => void;
  }) => {
    const [messageText, setMessageText] = useState('');
    const [form] = Form.useForm();

    /**
     * Handles form submission
     */
    const handleSubmit = () => {
      if (!messageText.trim()) return;
      onSendMessage(messageText);
      setMessageText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <Form onFinish={handleSubmit} form={form} className="flex items-center gap-2">
        <Popover
          placement="topLeft"
          trigger="click"
          arrow={false}
          overlayClassName="media-upload-popover"
          content={
            <div className="flex flex-col gap-2 p-2 w-[200px]">
              <Upload
                accept="image/*"
                multiple
                showUploadList={false}
                beforeUpload={(file) => {
                  if (!file.type.startsWith('image/')) {
                    message.error('Please select an image file');
                    return Upload.LIST_IGNORE;
                  }

                  if (file.size > MAX_IMAGE_SIZE) {
                    message.error('File must be smaller than 16MB');
                    return Upload.LIST_IGNORE;
                  }

                  onMediaUpload([{ ...file, originFileObj: file }], 'image');
                  return false;
                }}
                customRequest={() => {
                  return undefined;
                }}>
                <Button
                  type="text"
                  icon={<FileImageOutlined />}
                  className="w-full text-left flex items-center gap-2">
                  <span>Photos</span>
                </Button>
              </Upload>
              <Upload
                accept="video/*"
                multiple
                showUploadList={false}
                beforeUpload={(file) => {
                  if (!file.type.startsWith('video/')) {
                    message.error('Please select a video file');
                    return Upload.LIST_IGNORE;
                  }

                  if (file.size > MAX_VIDEO_SIZE) {
                    message.error('File must be smaller than 128MB');
                    return Upload.LIST_IGNORE;
                  }

                  onMediaUpload([{ ...file, originFileObj: file }], 'video');
                  return false;
                }}
                customRequest={() => {
                  return undefined;
                }}>
                <Button
                  type="text"
                  icon={<VideoCameraOutlined />}
                  className="w-full text-left flex items-center gap-2">
                  <span>Videos</span>
                </Button>
              </Upload>
              <Upload
                accept={ALLOWED_DOC_TYPES.join(',')}
                multiple
                showUploadList={false}
                beforeUpload={(file) => {
                  if (!ALLOWED_DOC_TYPES.includes(file.type)) {
                    message.error('Unsupported document type');
                    return Upload.LIST_IGNORE;
                  }

                  if (file.size > MAX_DOC_SIZE) {
                    message.error('Document must be smaller than 100MB');
                    return Upload.LIST_IGNORE;
                  }

                  onMediaUpload([{ ...file, originFileObj: file }], 'document');
                  return false;
                }}
                customRequest={() => {
                  return undefined;
                }}>
                <Button
                  type="text"
                  icon={<FileOutlined />}
                  className="w-full text-left flex items-center gap-2">
                  <span>Documents</span>
                </Button>
              </Upload>
            </div>
          }>
          <Button
            type="text"
            icon={<PlusOutlined />}
            className="text-gray-600 border hover:text-green-600 hover:border-green-600"
          />
        </Popover>
        <Form.Item className="w-full p-0 m-0" rules={[{ required: true }]}>
          <TextArea
            placeholder="Type message here"
            className="rounded-full bg-white resize-none"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
        </Form.Item>
        <Button
          type="text"
          icon={<AudioOutlined />}
          onClick={() => {
            return onStartVoiceRecord();
          }}
          className="text-gray-600 border hover:text-green-600 hover:border-green-600"
        />
        <Button
          type="link"
          htmlType="submit"
          icon={<SendOutlined className="text-gray-600" />}
          className="text-gray-600 border hover:text-green-600 hover:border-green-600"
          disabled={!messageText.trim()}
        />
      </Form>
    );
  }
);

MessageInputForm.displayName = 'MessageInputForm';

/**
 * Messaging
 * @returns {React.FC} - return
 */
const Messaging = () => {
  const screens = useBreakpoint();
  const dispatch = useAppDispatch();
  const lgOrUp = Boolean(screens.lg);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const fetchedChatsRef = useRef<Set<string>>(new Set());

  const { chats } = useSelector((state: RootState) => {
    return state.messages;
  });
  const { activeChat, currentChat, messages } = useSelector(MessageSelector);
  const { user } = useSelector(AuthSelector);

  /**
   * Scrolls to the bottom of the messages list
   * @param {boolean} immediate - Whether to scroll immediately without smooth behavior
   */
  const scrollToBottom = (immediate = false) => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: immediate ? 'auto' : 'smooth'
      });
    }
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom(true);
  }, [messages]);

  // Scroll to bottom when media is loaded
  useEffect(() => {
    const mediaElements = document.querySelectorAll('img, video');
    mediaElements.forEach((element) => {
      element.addEventListener('load', () => {
        scrollToBottom(true);
      });
      element.addEventListener('loadeddata', () => {
        scrollToBottom(true);
      });
    });

    return () => {
      mediaElements.forEach((element) => {
        element.removeEventListener('load', () => {
          scrollToBottom(true);
        });
        element.removeEventListener('loadeddata', () => {
          scrollToBottom(true);
        });
      });
    };
  }, [messages]);

  useEffect(() => {
    // Only fetch messages if:
    // 1. There is an active chat
    // 2. The chat exists in our chats object
    // 3. The chat doesn't have any messages loaded yet OR messages array is empty
    // 4. The chat hasn't been fetched before (using ref)
    if (
      activeChat &&
      chats[activeChat] &&
      (!chats[activeChat].messages || chats[activeChat].messages.length === 0) &&
      !fetchedChatsRef.current.has(activeChat)
    ) {
      fetchedChatsRef.current.add(activeChat);
      dispatch(fetchChatMessages({ chatId: activeChat }));
    }
  }, [activeChat, dispatch, chats]);

  useEffect(() => {
    dispatch(fetchAvailableParticipants());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeChat || !currentChat) return;

      await dispatch(
        sendMessage({
          chatId: activeChat,
          text: text
        })
      );
    },
    [activeChat, currentChat, dispatch]
  );

  const handleMediaUpload = useCallback(
    async (files: UploadFile[], mediaType: 'image' | 'video' | 'document' | 'voice') => {
      if (!activeChat || !currentChat) return;

      for (const file of files) {
        try {
          await dispatch(
            sendMessage({
              chatId: activeChat,
              text: '',
              media: {
                type: mediaType,
                file: file.originFileObj as File,
                filename: file.name,
                fileSize: file.size,
                thumbnail:
                  mediaType === 'video'
                    ? await generateThumbnail(file.originFileObj as File)
                    : undefined
              }
            })
          ).unwrap();
        } catch (error: any) {
          console.log('error uploading media', error);
          message.error(error.message || 'Failed to upload media. Please try again.');
        }
      }
    },
    [activeChat, currentChat, dispatch]
  );

  // eslint-disable-next-line require-jsdoc
  const handleChatSelect = (chatId: string) => {
    if (user) {
      dispatch(setActiveChat(chatId));
      dispatch(acknowledgeMessages({ chatId: chatId }));
      dispatch(resetUnreadCount({ chatId, userId: user._id }));
    }
  };

  /**
   * Handles creating a new chat with selected user or opens existing one
   * @param {string} userId - ID of the user to start chat with
   */
  const handleNewChat = async (userId: string) => {
    try {
      const existingChat = Object.values(chats).find((chat) => {
        return (
          chat.type === 'individual' &&
          chat.participants.some((p) => {
            return p._id === userId;
          })
        );
      });

      if (existingChat) {
        // If chat exists, just open it
        dispatch(setActiveChat(existingChat._id));
        dispatch(acknowledgeMessages({ chatId: existingChat._id }));
      } else {
        // If no chat exists, create new one
        await dispatch(createChat(userId));
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error handling chat selection:', error);
    }
  };

  /**
   * Starts a call with the current chat participants
   * @param {boolean} isVideo - Whether to start a video call
   */
  const startCall = (isVideo: boolean = false) => {
    if (currentChat && user) {
      // Get all participants except the current user
      const otherParticipants = currentChat.participants.filter((p) => {
        return p._id !== user._id;
      });

      if (otherParticipants.length > 0) {
        // Generate a unique room ID
        const roomId = `${currentChat._id}-${Date.now()}`;

        // Create array of participant objects for the call state
        const participantsList = otherParticipants.map((p) => {
          return {
            id: p._id,
            username: p.username
          };
        });

        // Get participant IDs for the call service
        const participantIds = otherParticipants.map((p) => {
          return p._id;
        });

        // Create toUsernames object mapping IDs to usernames
        const toUsernames = otherParticipants.reduce(
          (acc, p) => {
            acc[p._id] = p.username;
            return acc;
          },
          {} as { [key: string]: string }
        );

        // Set call room in Redux with all participants
        dispatch(
          setCallRoom({
            roomId: roomId,
            userId: otherParticipants[0]._id, // Keep first participant as main for backward compatibility
            username: otherParticipants[0].username, // Keep first participant as main for backward compatibility
            isVideo: isVideo,
            participants: participantsList
          })
        );

        // Start the call with all participant IDs and usernames
        CallService.startCall(
          roomId,
          participantIds,
          isVideo,
          user.username,
          toUsernames,
          currentChat.type === 'group' ? currentChat.name : undefined,
          currentChat._id
        );
      }
    }
  };

  /**
   * Handles sending a voice message
   * @param {Blob} audioBlob - The recorded audio blob
   * @param {number} duration - The duration of the recording in seconds
   */
  const handleVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!activeChat || !currentChat) return;

    try {
      const file = new File([audioBlob], `voice-message-${Date.now()}.webm`, {
        type: 'audio/webm',
        lastModified: Date.now()
      }) as unknown as RcFile;

      file.uid = `-${Date.now()}`;

      await dispatch(
        sendMessage({
          chatId: activeChat,
          text: '',
          media: {
            type: 'voice',
            file: file,
            filename: file.name,
            fileSize: file.size,
            duration: duration
          }
        })
      ).unwrap();

      setIsVoiceRecording(false);
    } catch (error) {
      console.error('Error sending voice message:', error);
      message.error('Failed to send voice message');
    }
  };

  return (
    <SearchProvider>
      <Layout className="h-screen bg-white">
        <Sider style={{ background: '#40916c' }} width={55}>
          <div className="h-screen flex flex-col items-center justify-between">
            {/* profile top */}
            <div className="mt-2">
              <ProfileNav shape="square" />
              <Divider className="p-0 m-0 my-2" />
            </div>
            {/* sider departments */}
            <Button
              className="bg-slate-400 bg-opacity-35 hover:bg-black hover:opacity-25"
              type="link"
              icon={<Home className="h-5 w-5 text-white" />}
            />
            <Tooltip title="Video Conference" placement="right">
              <Button
                className="bg-slate-400 bg-opacity-35 mt-2 hover:bg-black hover:opacity-25"
                type="link"
                href="https://beepauth.averox.com"
                icon={<VideoCameraFilled className="h-5 w-5 text-white ml-1" />}
              />
            </Tooltip>
            <div className="h-screen flex flex-col items-center justify-center">
              {['T', 'F', 'I', 'M', 'E', 'W', 'S', 'H'].map((letter, i) => {
                return (
                  <Avatar
                    shape="square"
                    key={i}
                    className={`text-lg mb-2 bg-light font-bold cursor-pointer hover:opacity-50`}>
                    {letter}
                  </Avatar>
                );
              })}
            </div>
            <Button
              size="large"
              type="link"
              icon={<PlusOutlined className="h-4 w-4 text-white hover:rotate-90 transition-all" />}
            />

            <div className="flex flex-col">
              {/* <Button size="large" type="link" icon={<GroupSvg className="h-5 w-5 text-white" />} /> */}
              <Button
                size="large"
                type="link"
                icon={<SettingFilled className="text-white hover:rotate-45 transition-all" />}
              />
            </div>
          </div>
        </Sider>

        {lgOrUp && (
          <Sider
            collapsible
            trigger={null}
            collapsed={!lgOrUp}
            className="border-r"
            width={281}
            style={{
              background: 'white'
            }}>
            <div className="flex flex-col justify-between h-full items-end">
              <div className="w-full">
                <div className="flex bg-[hsla(0, 0%, 96%, 0.9)] items-center h-[50px]">
                  <SearchInput
                    onNewChat={handleNewChat}
                    onOpenGroupModal={() => {
                      return setGroupModalVisible(true);
                    }}
                  />
                </div>
                <Divider className="p-0 m-0" />

                <div className="p-2">
                  <ScalableSegment
                    block
                    defaultValue="Chats"
                    className="rounded-full bg-[#CEF6DB] overflow-hidden"
                    options={[
                      {
                        label: 'Chats',
                        value: 'Chats',
                        icon: <MessageOutlined />,
                        content: <Chats onChatSelect={handleChatSelect} />
                      },
                      {
                        label: 'Groups',
                        value: 'Groups',
                        icon: <UsergroupAddOutlined />,
                        content: <Groups onGroupSelect={handleChatSelect} />
                      },
                      {
                        label: 'Calls',
                        value: 'Calls',
                        icon: <PhoneOutlined />,
                        content: <Calls />
                      }
                    ]}
                  />
                </div>
              </div>

              <FloatButton.Group
                trigger="hover"
                type="default"
                className="absolute"
                style={{ insetInlineEnd: 10 }}
                icon={<PlusOutlined className="text-[green] rounded-full" />}>
                {/* <Tooltip title="New Chat" placement="left">
                  <FloatButton icon={<MessageSquarePlus size={20} />} />
                </Tooltip> */}
                <Tooltip title="New Group" placement="left">
                  <FloatButton
                    icon={
                      <MessagesSquare
                        size={20}
                        onClick={() => {
                          setGroupModalVisible(true);
                        }}
                      />
                    }
                  />
                </Tooltip>
              </FloatButton.Group>
            </div>
          </Sider>
        )}

        <Layout>
          <Header style={{ height: 50 }} className="bg-white border-b px-4">
            <Row justify={'space-between'} align={'middle'}>
              <Col flex={'auto'} xs={12} sm={12} md={16} lg={18} className="flex items-center h-12">
                {currentChat && (
                  <div className="gap-1 flex items-center">
                    {currentChat.type === 'group' ? (
                      <Avatar
                        size={45}
                        src={currentChat.avatar}
                        icon={
                          <span className="text-green-950 font-bold">
                            {currentChat.name?.[ZERO].toUpperCase()}
                          </span>
                        }
                        className="rounded-full border-3 border-white"
                        style={{ backgroundColor: '#CEF6DB' }}>
                        {!currentChat.avatar && currentChat.name?.[ZERO]}
                      </Avatar>
                    ) : (
                      <OnlineStatusAvatar
                        userId={
                          currentChat.participants.find((p) => {
                            return p._id !== user?._id;
                          })?._id || ''
                        }
                        avatarProps={{
                          size: 45,
                          src: currentChat.participants.find((p) => {
                            return p._id !== user?._id;
                          })?.avatar,
                          icon: <UserOutlined />,
                          className: 'rounded-full border-3 border-white',
                          style: { backgroundColor: '#CEF6DB' }
                        }}
                      />
                    )}
                    <div className="flex flex-col p-0 m-0">
                      <Text className="font-medium capitalize">
                        {currentChat.type === 'group'
                          ? currentChat.name
                          : currentChat.participants.find((p) => {
                              return p._id !== user?._id;
                            })?.username}
                      </Text>
                      {currentChat.type === 'group' && (
                        <Text className="text-xs text-gray-500">
                          {currentChat.participants
                            .filter((p) => {
                              return p._id !== user?._id;
                            })
                            .map((p) => {
                              return p.username;
                            })
                            .slice(ZERO, THREE)
                            .join(', ')}
                          {currentChat.participants.length > FOUR &&
                            ` +${currentChat.participants.length - FOUR} more`}
                        </Text>
                      )}
                    </div>
                  </div>
                )}
              </Col>
              <Col flex={'0'} xs={12} sm={12} md={8} lg={6}>
                <div className="flex items-center sm:gap-2">
                  <Button
                    type="text"
                    icon={<PhoneOutlined className="text-green-600" />}
                    onClick={() => {
                      startCall(false);
                    }}
                  />
                  <Button
                    type="text"
                    icon={<VideoCameraOutlined className="text-green-600" />}
                    onClick={() => {
                      startCall(true);
                    }}
                  />
                  <Button type="text" icon={<SearchOutlined className="text-green-600" />} />
                  <Button type="text" icon={<MoreOutlined className="text-green-600" />} />
                </div>
              </Col>
            </Row>
          </Header>

          <Content
            ref={contentRef}
            style={{
              background: `url(${ChatBgImg})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
            className="p-4 h-screen overflow-y-scroll">
            <div className="max-w-[567px] mx-auto bg-[#CEF6DB] text-center rounded-lg p-3 mb-6 flex items-center gap-2 text-sm">
              <p>
                <LockFilled className="w-4 h-4 text-[#ffd900b1]" />
                Messages and calls are end-to-end encrypted. No one out of this chat, not even Beep,
                can read or listen to them. Tap to{' '}
                <span className="text-green-600">learn more</span>.
              </p>
            </div>

            <div className="space-y-4">
              {Array.isArray(messages) &&
                messages.map((message) => {
                  if (message.media) {
                    return (
                      <MediaMessage
                        key={message._id}
                        _id={message._id}
                        type={message.media.type}
                        url={message.media.url}
                        fileName={message.media.fileName}
                        fileSize={message.media.fileSize}
                        mimeType={message.media.mimeType}
                        thumbnail={message.media.thumbnailUrl}
                        received={message.senderId !== user?._id}
                        isGroup={currentChat?.type === 'group'}
                        sender={currentChat?.participants.find((p) => {
                          return p._id === message.senderId;
                        })}
                        timestamp={message.timestamp}
                        duration={message.media?.duration}
                        reactions={message.reactions}
                      />
                    );
                  }
                  return (
                    <Message
                      key={message._id}
                      _id={message._id}
                      text={message.text}
                      timestamp={message.timestamp}
                      received={message.senderId !== user?._id}
                      seenBy={message.seenBy}
                      isSent={message.isSent}
                      senderId={message.senderId}
                      reactions={message.reactions}
                      isGroup={currentChat?.type === 'group'}
                      sender={currentChat?.participants.find((p) => {
                        return p._id === message.senderId;
                      })}
                    />
                  );
                })}
            </div>
          </Content>

          <div className="bg-white p-3">
            {isVoiceRecording ? (
              <VoiceRecorder
                onSend={handleVoiceMessage}
                onCancel={() => {
                  setIsVoiceRecording(false);
                }}
              />
            ) : (
              <MessageInputForm
                onSendMessage={handleSendMessage}
                onStartVoiceRecord={() => {
                  return setIsVoiceRecording(true);
                }}
                onMediaUpload={handleMediaUpload}
              />
            )}
          </div>
        </Layout>

        <CallModal />
        <NewGroupModal
          visible={groupModalVisible}
          onClose={() => {
            return setGroupModalVisible(false);
          }}
        />

        <style>
          {`
            .media-upload-popover .ant-popover-inner {
              padding: 0;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            .media-upload-popover .ant-popover-arrow {
              display: none;
            }
            .media-upload-popover .ant-btn {
              padding: 8px 12px;
              height: auto;
            }
            .media-upload-popover .ant-btn:hover {
              background-color: #f5f5f5;
              color: #4CAF50;
            }
          `}
        </style>
      </Layout>
    </SearchProvider>
  );
};

export default Messaging;
