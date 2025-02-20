import { io, Socket } from 'socket.io-client';
import { Middleware } from 'redux';
import store, { RootState, AppDispatch } from '../../store';
import { updateAlert } from 'appRedux/actions/alertAction';
import { backendUrl } from 'config';
import * as events from './events';
import { setCallInfo, setCallRoom } from 'appRedux/reducers/callReducer';
import CallService from 'services/CallService';
import NotificationService from 'services/NotificationService';
import { handleMessageReaction } from '../../actions/messageAction';
import { setOnlineUsers } from '../../reducers/onlineUsersReducer';
import { updateChat } from 'appRedux/reducers/messageReducer';
import { IChat } from 'types/ReduxTypes/message/reducer';

// Action Types
export const CONNECT_SOCKET = 'CONNECT_SOCKET';
export const DISCONNECT_SOCKET = 'DISCONNECT_SOCKET';

let socket: Socket | null = null;

/**
 * Helper to emit events to the socket server
 * @param {string} event - prm
 * @param {any} data - prm
 * @returns {Promise<any>} prm
 */
export function socketEmit(event: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!socket?.connected) {
      reject(new Error('Socket not connected'));
      return;
    }

    socket.emit(event, data, (response: any) => {
      if (response?.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
}

/**
 * Initialize socket connection and event listeners
 * @param {string} userId - prm
 * @param {AppDispatch} dispatch - prm
 */
function initializeSocket(userId: string, dispatch: AppDispatch) {
  if (socket?.connected) {
    socket.disconnect();
  }

  socket = io(backendUrl, {
    withCredentials: true,
    transports: ['websocket']
  });

  // Initialize services
  CallService.initialize(socket);
  NotificationService.initialize().catch(console.error);

  // Connection events
  socket.on(events.CONNECT_SOCKET, () => {
    if (socket) {
      socket.emit(events.ADD_USER, userId);
    }
  });

  socket.on(events.DISCONNECT_SOCKET, () => {
    dispatch(
      updateAlert({
        place: 'tc',
        message: 'Disconnected from chat server',
        type: 'warning'
      })
    );
  });

  socket.on('connect_error', () => {
    dispatch(
      updateAlert({
        place: 'tc',
        message: 'Failed to connect to chat server',
        type: 'error'
      })
    );
  });

  socket.on(
    'incoming_call',
    async ({
      roomId,
      fromUserId,
      fromUsername,
      isVideo,
      participants,
      isGroup,
      groupName,
      callLogId
    }) => {
      if (fromUserId === store.getState().auth.user?._id) {
        return;
      }

      console.log('Received incoming call:', {
        roomId: roomId,
        fromUserId: fromUserId,
        fromUsername: fromUsername,
        isVideo: isVideo,
        participants: participants,
        callLogId: callLogId
      });

      NotificationService.showIncomingCallNotification(fromUsername, isVideo, isGroup, groupName);

      dispatch(
        setCallRoom({
          roomId: roomId,
          userId: fromUserId,
          username: fromUsername,
          isVideo: isVideo,
          isIncoming: true,
          participants: participants,
          callLogId: callLogId
        })
      );

      store.dispatch(
        setCallInfo({
          callerInfo: {
            username: fromUsername,
            isGroupCall: isGroup,
            groupName: groupName
          },
          callLogId: callLogId
        })
      );
    }
  );

  // Chat events
  socket.on(
    events.RECEIVE_MESSAGE,
    (data: {
      chatId: string;
      message: {
        _id: string;
        senderId: string;
        text: string;
        timestamp: Date;
        isSent: boolean;
        seenBy: string[];
      };
    }) => {
      dispatch({
        type: 'messages/addMessage',
        payload: {
          chatId: data.chatId,
          message: data.message
        }
      });

      // Check if this chat is currently open
      const state = store.getState();
      const activeChat = state.messages.activeChat;

      // If chat is open, acknowledge message immediately
      if (activeChat === data.chatId && socket) {
        socket.emit(events.ACKNOWLEDGE_MESSAGES, {
          chatId: data.chatId,
          receiverId: state.auth.user?._id
        });
      }

      // dispatch(
      //   updateAlert({
      //     place: 'tc',
      //     message: 'New message received',
      //     type: 'info'
      //   })
      // );
    }
  );

  socket.on(
    events.MESSAGE_STATUS_UPDATE,
    (data: {
      chatId: string;
      messageId: string;
      isSent: boolean;
      tempId?: string;
      seenBy?: string[];
    }) => {
      console.log('Received message status update:', data);
      dispatch({
        type: 'messages/updateMessageStatus',
        payload: {
          chatId: data.chatId,
          messageId: data.messageId,
          isSent: data.isSent,
          tempId: data.tempId,
          seenBy: data.seenBy
        }
      });
    }
  );

  // Handle reaction events
  socket.on(events.REACTION_RECEIVED, (data) => {
    console.log('Socket: Reaction received event:', data);
    store.dispatch(
      handleMessageReaction({
        messageId: data.messageId,
        chatId: data.chatId,
        reaction: data.reaction,
        type: 'add'
      })
    );
  });

  socket.on(events.REACTION_REMOVED, (data) => {
    console.log('Socket: Reaction removed event:', data);
    store.dispatch(
      handleMessageReaction({
        messageId: data.messageId,
        chatId: data.chatId,
        reaction: data.reaction,
        type: 'remove'
      })
    );
  });

  // Handle online users update
  socket.on(events.ONLINE_USERS_UPDATE, (data: { onlineUsers: string[] }) => {
    console.log('Socket: Online users update received:', data);
    dispatch(setOnlineUsers(data.onlineUsers));
  });

  // Group Events
  socket.on(events.CREATE_GROUP, (data: { chat: IChat }) => {
    dispatch(updateChat(data.chat));
  });

  socket.connect();
}

/**
 * Socket middleware
 * @returns { Middleware<{}, RootState> } - return
 */
export const socketMiddleware: Middleware<{}, RootState> = () => {
  return (next) => {
    return (action) => {
      if (action.type === CONNECT_SOCKET) {
        const userId = store.getState().auth.user?._id;
        if (userId) {
          initializeSocket(userId, store.dispatch);
        }
      }

      if (action.type === DISCONNECT_SOCKET && socket) {
        socket.disconnect();
        socket = null;
      }

      return next(action);
    };
  };
};

export default {
  socketEmit: socketEmit,
  socketMiddleware: socketMiddleware,
  events: events
};
