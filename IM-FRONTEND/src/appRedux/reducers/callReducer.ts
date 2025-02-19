import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CallState {
  isIncoming: boolean;
  isOngoing: boolean;
  roomId: string | null;
  remoteUserId: string | null;
  remoteUsername: string | null;
  participants: { [key: string]: { id: string; username: string } };
  localStream: MediaStream | null;
  remoteStreams: { [key: string]: MediaStream };
  isVideo: boolean;
  producers: { [key: string]: any };
  consumers: { [key: string]: any };
  callerInfo: {
    username: string;
    isGroupCall: boolean;
    groupName?: string;
  } | null;
  callLogId: string | null;
}

const initialState: CallState = {
  isIncoming: false,
  isOngoing: false,
  roomId: null,
  remoteUserId: null,
  remoteUsername: null,
  participants: {},
  localStream: null,
  remoteStreams: {},
  isVideo: false,
  producers: {},
  consumers: {},
  callerInfo: null,
  callLogId: null
};

const callSlice = createSlice({
  name: 'call',
  initialState: initialState,
  reducers: {
    setCallRoom: (
      state,
      action: PayloadAction<{
        roomId: string;
        userId: string;
        username: string;
        isVideo: boolean;
        isIncoming?: boolean;
        participants?: { id: string; username: string }[];
        callLogId?: string;
      }>
    ) => {
      console.log('1st: Setting call room:', action.payload);
      console.log('callLogId in setCallRoom', action.payload.callLogId);
      state.roomId = action.payload.roomId;
      state.remoteUserId = action.payload.userId;
      state.remoteUsername = action.payload.username;
      state.isVideo = action.payload.isVideo;
      state.isIncoming = action.payload.isIncoming ?? false;
      state.callLogId = action.payload.callLogId ?? null;

      if (action.payload.participants) {
        state.participants = {};
        action.payload.participants.forEach((participant) => {
          state.participants[participant.id] = participant;
        });
      } else {
        state.participants = {
          [action.payload.userId]: {
            id: action.payload.userId,
            username: action.payload.username
          }
        };
      }
    },
    setOngoingCall: (state, action: PayloadAction<boolean>) => {
      state.isOngoing = action.payload;
      if (action.payload) {
        state.isIncoming = false;
      }
    },
    setLocalStream: (state, action: PayloadAction<MediaStream | null>) => {
      if (action.payload) {
        console.log('Setting local stream:', {
          id: action.payload.id,
          active: action.payload.active,
          tracks: action.payload.getTracks().map((track) => {
            return {
              kind: track.kind,
              id: track.id,
              enabled: track.enabled,
              readyState: track.readyState
            };
          })
        });
      }
      state.localStream = action.payload;

      console.log('local stream set in store after', state.localStream);
    },
    addRemoteStream: (
      state,
      action: PayloadAction<{ userId: string; stream: MediaStream | null }>
    ) => {
      if (action.payload.stream) {
        state.remoteStreams[action.payload.userId] = action.payload.stream;
      } else {
        delete state.remoteStreams[action.payload.userId];
      }
    },
    removeRemoteStream: (state, action: PayloadAction<string>) => {
      delete state.remoteStreams[action.payload];
    },
    addProducer: (state, action: PayloadAction<{ kind: string; producer: any }>) => {
      state.producers[action.payload.kind] = action.payload.producer;
    },
    addConsumer: (state, action: PayloadAction<{ id: string; consumer: any }>) => {
      state.consumers[action.payload.id] = action.payload.consumer;
    },
    removeConsumer: (state, action: PayloadAction<string>) => {
      delete state.consumers[action.payload];
    },
    resetCallState: (state) => {
      return initialState;
    },
    setCallInfo: (state, action) => {
      state.callerInfo = action.payload.callerInfo;
      state.callLogId = action.payload.callLogId;
    }
  }
});

export const {
  setCallRoom,
  setOngoingCall,
  setLocalStream,
  addRemoteStream,
  removeRemoteStream,
  addProducer,
  addConsumer,
  removeConsumer,
  resetCallState,
  setCallInfo
} = callSlice.actions;

export default callSlice.reducer;
