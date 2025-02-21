export const CONNECT_SOCKET = 'connect';
export const DISCONNECT_SOCKET = 'disconnect';
export const SEND_MESSAGE = 'send_message';
export const RECEIVE_MESSAGE = 'receive_message';
export const MESSAGE_SEEN = 'message_seen';
export const MESSAGE_STATUS_UPDATE = 'message_status_update';
export const ACKNOWLEDGE_MESSAGES = 'acknowledge_messages';
export const ADD_USER = 'add_user';
export const NEW_CHAT = 'new_chat';

// Call events
export const CREATE_ROOM = 'create_room';
export const JOIN_ROOM = 'join_room';
export const LEAVE_ROOM = 'leave_room';
export const CREATE_TRANSPORT = 'create_transport';
export const CONNECT_TRANSPORT = 'connect_transport';
export const PRODUCE = 'produce';
export const CONSUME = 'consume';
export const RESUME_CONSUMER = 'resume_consumer';
export const NEW_PRODUCER = 'new_producer';
export const PRODUCER_CLOSED = 'producer_closed';
export const INCOMING_CALL = 'incoming_call';
export const PEER_LEFT = 'peer_left';

// Mediasoup events
export const GET_PRODUCER = 'get_producer';
export const GET_CONSUMER = 'get_consumer';
export const DISCONNECT_ROOM = 'disconnect_room';

// Message reactions
export const SEND_REACTION = 'send_reaction';
export const REMOVE_REACTION = 'remove_reaction';
export const REACTION_RECEIVED = 'reaction_received';
export const REACTION_REMOVED = 'reaction_removed';

// Online users events
export const ONLINE_USERS_UPDATE = 'online_users_update';

// Group events
export const CREATE_GROUP = 'create_group';

// Typing events
export const USER_TYPING = 'user_typing';
export const USER_STOPPED_TYPING = 'user_stopped_typing';
export const TYPING_STATUS_UPDATE = 'typing_status_update';
