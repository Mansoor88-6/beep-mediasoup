import mongoose, { Schema, model } from "mongoose";
import { IMessageDocument } from "./types";

mongoose.set("useCreateIndex", true);

const MessageSchema: Schema = new Schema({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: "chats",
    required: true,
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  isSent: {
    type: Boolean,
    default: false,
    required: true,
  },
  isSeen: {
    type: Boolean,
    default: false,
    required: true,
  },
});

export default model<IMessageDocument>("messages", MessageSchema);
