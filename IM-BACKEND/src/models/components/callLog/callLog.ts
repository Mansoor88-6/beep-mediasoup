import mongoose, { Schema, model } from "mongoose";
import { ICallLogDocument, CallType, CallState, CallStatus } from "./types";

const CallParticipantSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  joinedAt: {
    type: Date,
    required: true,
  },
  leftAt: {
    type: Date,
  },
  role: {
    type: String,
    enum: ["initiator", "receiver"],
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(CallStatus),
    required: true,
    default: CallStatus.UNANSWERED,
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String,
  },
});

const CallLogSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "chats",
      required: true,
    },
    callType: {
      type: String,
      enum: Object.values(CallType),
      required: true,
    },
    state: {
      type: String,
      enum: Object.values(CallState),
      required: true,
      default: CallState.ONGOING,
    },
    participants: [CallParticipantSchema],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    quality: {
      avgBitrate: Number,
      packetLoss: Number,
      latency: Number,
    },
    recordingUrl: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
CallLogSchema.index({ chatId: 1, startTime: -1 });
CallLogSchema.index({ "participants.userId": 1, startTime: -1 });
CallLogSchema.index({ state: 1 });
CallLogSchema.index({ callType: 1 });
CallLogSchema.index({ "participants.status": 1 });

// Calculate duration before saving if endTime is present
CallLogSchema.pre<ICallLogDocument>("save", function (next) {
  if (this.endTime && this.startTime) {
    this.duration = Math.floor(
      (this.endTime.getTime() - this.startTime.getTime()) / 1000
    );
  }
  next();
});

export default model<ICallLogDocument>("callLogs", CallLogSchema);
