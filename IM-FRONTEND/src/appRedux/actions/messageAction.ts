/* eslint-disable no-useless-catch */
/* eslint-disable no-magic-numbers */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BackendInstance, config } from 'config';
import Socket from '../middleware/socket/socketMiddleware';
import {
  setLoading,
  setError,
  setAvailableParticipants,
  setActiveChat,
  addChat,
  updateChat,
  setChats
} from '../reducers/messageReducer';
import { IChat, IReaction } from 'views/messaging/components/types';
import { RootState } from '../store';
import * as events from '../middleware/socket/events';
// Socket event types

export const sendMessage = createAsyncThunk<
  IChat,
  {
    chatId: string;
    text: string;
    media?: {
      type: 'image' | 'video' | 'document' | 'voice';
      file: File;
      filename: string;
      fileSize?: number;
      thumbnail?: string;
      duration?: number;
    };
  }
>('messages/sendMessage', async ({ chatId, text, media }, { dispatch, getState }) => {
  try {
    const tempId = `temp_${Date.now()}`;
    const messageData = {
      _id: tempId,
      senderId: (getState() as any).auth.user._id,
      text: text,
      timestamp: new Date(),
      seenBy: [],
      isSent: false
    };

    // If there's media, upload it first
    if (media) {
      const formData = new FormData();
      formData.append('media', media.file);
      formData.append('type', media.type);
      formData.append('filename', media.filename);
      if (media.type === 'video') {
        formData.append('generateThumbnail', 'true');
      }
      if (media.thumbnail) {
        formData.append('thumbnail', media.thumbnail);
      }
      if (media.duration) {
        formData.append('duration', media.duration.toString());
      }

      // Upload the file
      try {
        const uploadResponse = await BackendInstance.post('messages/upload', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        });

        // Match the backend's media format
        Object.assign(messageData, {
          media: {
            type: uploadResponse.data.data.type,
            url: uploadResponse.data.data.url,
            fileName: uploadResponse.data.data.fileName,
            fileSize: uploadResponse.data.data.fileSize,
            thumbnailUrl:
              uploadResponse.data.data.thumbnailUrl || uploadResponse.data.data.thumbnail,
            width: uploadResponse.data.data.width,
            height: uploadResponse.data.data.height,
            mimeType: uploadResponse.data.data.mimeType,
            duration: uploadResponse.data.data.duration
          }
        });
      } catch (error: any) {
        // Handle API error response
        if (error.response?.data) {
          const errorMessage =
            error.response.data.messages?.[0] ||
            error.response.data.message ||
            'Failed to upload media';
          throw new Error(errorMessage);
        }
        throw error;
      }

    }

    const currentChat = (getState() as any).messages.chats[chatId];
    dispatch(
      updateChat({
        ...currentChat,
        _id: chatId,
        messages: [...(currentChat?.messages || []), messageData]
      })
    );

    // Send message to socket
    return new Promise<IChat>((resolve, reject) => {
      Socket.socketEmit(events.SEND_MESSAGE, {
        chatId: chatId,
        message: messageData,
        tempId: tempId
      })
        .then((response: { data: { chat: IChat; message: any } }) => {
          if (response?.data?.chat) {
            // dispatch(updateChat(response.data.chat));
            resolve(response.data.chat);
          } else {
            reject(new Error('Invalid message response format'));
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  } catch (error) {
    console.log('error uploading media', error);
    throw error;
  }
});

export const fetchChatMessages = createAsyncThunk(
  'messages/fetchChatMessages',
  async ({ chatId }: { chatId: string }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await BackendInstance.get(`messages/chats/${chatId}/messages`, config);

      dispatch(updateChat(response.data.data));
      return response.data.data;
    } catch (error) {
      dispatch(setError('Failed to fetch messages'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Handle received messages via socket
 * @param {object} data - The received message data
 * @param {IChat} data.chat - The updated chat object
 * @returns {Function} Redux thunk function
 */
export const handleReceivedMessage = (data: { chat: IChat }) => {
  return (dispatch: any) => {
    // Update the chat with the new message
    dispatch(updateChat(data.chat));

    // Mark message as seen
    Socket.socketEmit(events.MESSAGE_SEEN, {
      chatId: data.chat._id
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to mark message as seen:', error);
    });
  };
};

export const fetchAvailableParticipants = createAsyncThunk(
  'messages/fetchAvailableParticipants',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await BackendInstance.get('user/chat-participants', config);
      dispatch(setAvailableParticipants(response.data.data));
      return response.data.data;
    } catch (error) {
      dispatch(setError('Failed to fetch available participants'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createChat = createAsyncThunk(
  'messages/createChat',
  async (participantId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await BackendInstance.post(
        'chats/create',
        { participantId: participantId },
        config
      );
      const chat = response.data.data;
      dispatch(addChat(chat));
      dispatch(setActiveChat(chat._id));
      return chat;
    } catch (error) {
      dispatch(setError('Failed to create chat'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchChats = createAsyncThunk('messages/fetchChats', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    const response = await BackendInstance.get('chats', config);
    const chats = response.data.data;

    const chatsObject = chats.reduce((acc: { [key: string]: IChat }, chat: IChat) => {
      acc[chat._id] = chat;
      return acc;
    }, {});

    dispatch(setChats(chatsObject));
    return chats;
  } catch (error) {
    dispatch(setError('Failed to fetch chats'));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
});

export const acknowledgeMessages = createAsyncThunk(
  'messages/acknowledgeMessages',
  async ({ chatId }: { chatId: string }, { getState }) => {
    try {
      const currentUser = (getState() as RootState).auth.user;
      if (!currentUser) return;

      await Socket.socketEmit(events.ACKNOWLEDGE_MESSAGES, {
        chatId: chatId,
        receiverId: currentUser._id
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to acknowledge messages:', error);
    }
  }
);

export const createGroup = createAsyncThunk(
  'messages/createGroup',
  async (
    groupData: {
      name: string;
      description?: string;
      participantIds: string[];
    },
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await BackendInstance.post('chats/group', groupData, config);
      const chat = response.data.data;
      dispatch(addChat(chat));
      dispatch(setActiveChat(chat._id));
      return chat;
    } catch (error) {
      dispatch(setError('Failed to create group'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const sendMessageReaction = createAsyncThunk(
  'messages/sendMessageReaction',
  async ({ messageId, emoji }: { messageId: string; emoji: string }, { dispatch, getState }) => {
    try {
      const currentUser = (getState() as RootState).auth.user;
      if (!currentUser) throw new Error('User not authenticated');

      const response = await Socket.socketEmit(events.SEND_REACTION, {
        messageId: messageId,
        emoji: emoji,
        userId: currentUser._id,
        username: currentUser.username
      });

      if (response?.data?.message) {
        const state = getState() as RootState;
        const chat = Object.values(state.messages.chats).find((chat) => {
          return chat.messages.some((m) => {
            return m._id === messageId;
          });
        });

        if (chat) {
          const updatedMessages = chat.messages.map((msg) => {
            return msg._id === messageId ? response.data.message : msg;
          });

          dispatch(
            updateChat({
              ...chat,
              messages: updatedMessages
            })
          );
        }
      }
    } catch (error) {
      console.error('Failed to send reaction:', error);
      throw error;
    }
  }
);

export const removeMessageReaction = createAsyncThunk(
  'messages/removeMessageReaction',
  async ({ messageId, emoji }: { messageId: string; emoji: string }, { dispatch, getState }) => {
    try {
      const currentUser = (getState() as RootState).auth.user;
      if (!currentUser) throw new Error('User not authenticated');

      // First update the local state immediately
      const state = getState() as RootState;
      const chat = Object.values(state.messages.chats).find((chat) => {
        return chat.messages.some((m) => {
          return m._id === messageId;
        });
      });

      if (chat) {
        const updatedMessages = chat.messages.map((msg) => {
          if (msg._id === messageId) {
            const currentReactions = Array.isArray(msg.reactions) ? msg.reactions : [];
            return {
              ...msg,
              reactions: currentReactions.filter((r) => {
                return !(r.userId === currentUser._id && r.emoji === emoji);
              })
            };
          }
          return msg;
        });

        dispatch(
          updateChat({
            ...chat,
            messages: updatedMessages
          })
        );
      }

      // Then emit to socket
      const response = await Socket.socketEmit(events.REMOVE_REACTION, {
        messageId: messageId,
        emoji: emoji,
        userId: currentUser._id
      });

    } catch (error) {
      console.error('Failed to remove reaction:', error);
      throw error;
    }
  }
);

/**
 * Handle message reactions
 * @param {object} data - The data containing messageId, chatId, reaction, and type
 * @param {string} data.messageId - The ID of the message
 * @param {string} data.chatId - The ID of the chat
 * @param {IReaction} data.reaction - The reaction to add or remove
 * @param {string} data.type - The type of action to perform ('add' or 'remove')
 */
export const handleMessageReaction = (data: {
  messageId: string;
  chatId: string;
  reaction: IReaction;
  type: 'add' | 'remove';
}) => {
  return (dispatch: any, getState: () => RootState) => {
    const { messages } = getState();
    const chat = messages.chats[data.chatId];
    if (!chat) return;

    const message = chat.messages.find((m) => {
      return m._id === data.messageId;
    });
    if (!message) return;

    const updatedMessages = chat.messages.map((msg) => {
      if (msg._id === data.messageId) {
        // Initialize reactions array if it doesn't exist
        const currentReactions = Array.isArray(msg.reactions) ? msg.reactions : [];

        if (data.type === 'add') {
          // Remove any existing reaction from this user
          const filteredReactions = currentReactions.filter((r) => {
            return r.userId !== data.reaction.userId;
          });

          // Add the new reaction
          return {
            ...msg,
            reactions: [...filteredReactions, data.reaction]
          };
        }

        // For remove, immediately remove the reaction from the current user
        return {
          ...msg,
          reactions: currentReactions.filter((r) => {
            return r.userId !== data.reaction.userId;
          })
        };
      }
      return msg;
    });

    dispatch(
      updateChat({
        ...chat,
        messages: updatedMessages
      })
    );
  };
};
