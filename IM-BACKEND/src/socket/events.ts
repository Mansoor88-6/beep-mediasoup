/* eslint-disable no-unused-vars */
export const events = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
  ADD_USER: "add_user",
  ONLINE_USERS_UPDATE: "online_users_update",
  NEW_CHAT: "new_chat",

  // Group Events
  CREATE_GROUP: "create_group",
  ADD_GROUP_PARTICIPANTS: "add_group_participants",
  REMOVE_GROUP_PARTICIPANTS: "remove_group_participants",
  UPDATE_GROUP_INFO: "update_group_info",
  DELETE_GROUP: "delete_group",
  LEAVE_GROUP: "leave_group",
  GET_GROUP_INFO: "get_group_info",
  GET_GROUP_MESSAGES: "get_group_messages",

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
  CALL_STATUS_UPDATE: "call_status_update",
  CALL_QUALITY_UPDATE: "call_quality_update",

} as const;
