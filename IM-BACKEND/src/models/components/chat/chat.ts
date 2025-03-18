// import mongoose, { Schema, model, Types } from "mongoose";
// import { IChatDocument } from "./types";

// mongoose.set("useCreateIndex", true);

// const MessageSchema = new Schema({
//   senderId: {
//     type: Schema.Types.ObjectId,
//     ref: "users",
//     required: true,
//   },
//   text: {
//     type: String,
//     default: "",
//   },
//   media: new Schema(
//     {
//       url: {
//         type: String,
//         required: function (this: any) {
//           const message = this.parent();
//           return (
//             message && message.isNew && this && Object.keys(this).length > 0
//           );
//         },
//       },
//       thumbnailUrl: {
//         type: String,
//       },
//       type: {
//         type: String,
//         enum: ["image", "video", "audio", "document", "voice"],
//         required: function (this: any) {
//           const message = this.parent();
//           return (
//             message && message.isNew && this && Object.keys(this).length > 0
//           );
//         },
//       },
//       fileName: {
//         type: String,
//         required: function (this: any) {
//           const message = this.parent();
//           return (
//             message && message.isNew && this && Object.keys(this).length > 0
//           );
//         },
//       },
//       fileSize: {
//         type: Number,
//         required: function (this: any) {
//           const message = this.parent();
//           return (
//             message && message.isNew && this && Object.keys(this).length > 0
//           );
//         },
//       },
//       mimeType: {
//         type: String,
//         required: function (this: any) {
//           const message = this.parent();
//           return (
//             message && message.isNew && this && Object.keys(this).length > 0
//           );
//         },
//       },
//       duration: {
//         type: Number,
//         required: false,
//       },
//       width: { type: Number },
//       height: { type: Number },
//     },
//     {
//       _id: false,
//       strict: true,
//     }
//   ),
//   timestamp: {
//     type: Date,
//     default: Date.now,
//     required: true,
//   },
//   isSent: {
//     type: Boolean,
//     default: false,
//     required: true,
//   },
//   seenBy: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: "users",
//     },
//   ],
//   reactions: [
//     {
//       emoji: { type: String, required: true },
//       userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
//       username: { type: String, required: true },
//       timestamp: { type: Date, default: Date.now, required: true },
//     },
//   ],
// });

// const ParticipantSchema = new Schema({
//   _id: {
//     type: Schema.Types.ObjectId,
//     ref: "users",
//     required: true,
//   },
//   username: {
//     type: String,
//     required: true,
//   },
//   avatar: {
//     type: String,
//   },
//   role: {
//     type: String,
//     enum: ["admin", "member"],
//     default: "member",
//   },
//   joinedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const ChatSchema = new Schema(
//   {
//     type: {
//       type: String,
//       enum: ["individual", "group"],
//       required: true,
//       default: "individual",
//     },
//     name: {
//       type: String,
//       required: function (this: IChatDocument) {
//         return this.type === "group";
//       },
//     },
//     description: {
//       type: String,
//     },
//     avatar: {
//       type: String,
//     },
//     participants: [ParticipantSchema],
//     messages: [MessageSchema],
//     lastMessage: {
//       type: String,
//     },
//     unreadCount: {
//       type: Object,
//       default: {},
//       required: true,
//     },
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "users",
//       required: true,
//     },
//     encryptionKey: { type: String, required: true },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes
// ChatSchema.index({ "messages.timestamp": -1 });
// ChatSchema.index({ "participants._id": 1 });
// ChatSchema.index({ type: 1 });
// ChatSchema.index({ createdBy: 1 });

// ChatSchema.pre<IChatDocument>("save", function (next) {
//   if (this.type === "group" && this.participants.length < 2) {
//     next(new Error("Group chat must have at least 2 participants"));
//   }
//   next();
// });

// export default model<IChatDocument>("chats", ChatSchema);
