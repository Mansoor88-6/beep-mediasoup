/* eslint-disable no-unused-vars */
export const events = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
  ADD_USER: "add_user",
  ONLINE_USERS_UPDATE: "online_users_update",
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  MESSAGE_STATUS_UPDATE: "message_status_update",
  ACKNOWLEDGE_MESSAGES: "acknowledge_messages",

  // MediaSoup Events
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  CREATE_ROOM: "create_room",
  GET_PRODUCER: "get_producer",
  GET_CONSUMER: "get_consumer",
  CONNECT_TRANSPORT: "connect_transport",
  PRODUCE: "produce",
  CONSUME: "consume",
  RESUME_CONSUMER: "resume_consumer",
  PRODUCER_CLOSED: "producer_closed",
  DISCONNECT_ROOM: "disconnect_room",
  NEW_PRODUCER: "new_producer",
  PEER_LEFT: "peer_left",

  // Call Log Events
  REJECT_CALL: "reject_call",
  MISSED_CALL: "missed_call",
  BUSY_CALL: "busy_call",
  CALL_QUALITY_UPDATE: "call_quality_update",

  // Reaction Events
  SEND_REACTION: "send_reaction",
  REMOVE_REACTION: "remove_reaction",
  REACTION_RECEIVED: "reaction_received",
  REACTION_REMOVED: "reaction_removed",
} as const;
