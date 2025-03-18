// import { Types } from "mongoose";
// import CallLog from "@models/components/callLog/callLog";
// import {
//   CallStatus,
//   CallState,
//   CallType,
//   ICallParticipant,
// } from "@models/components/callLog/types";
// import { logger } from "@config/logger";
// import Chat from "@models/components/chat/chat";

// export class CallLogService {
//   /**
//    * Create a new call log when a call is initiated
//    */
//   public static async createCallLog(
//     roomId: string,
//     callType: CallType,
//     initiatorId: string,
//     receiverIds: string[],
//     deviceInfo?: {
//       browser?: string;
//       os?: string;
//       device?: string;
//     }
//   ) {
//     try {
//       // First, find or create a chat for this call
//       let chat = await Chat.findOne({
//         $or: [
//           { _id: roomId }, // Try to find by roomId first
//           {
//             $and: [
//               { type: "individual" },
//               {
//                 participants: {
//                   $all: [
//                     { $elemMatch: { _id: initiatorId } },
//                     { $elemMatch: { _id: receiverIds[0] } },
//                   ],
//                   $size: 2,
//                 },
//               },
//             ],
//           },
//         ],
//       });

//       if (!chat && !Types.ObjectId.isValid(roomId)) {
//         // Create a new chat if none exists
//         chat = await Chat.create({
//           type: receiverIds.length > 1 ? "group" : "individual",
//           participants: [
//             { _id: initiatorId, role: "member" },
//             ...receiverIds.map((id) => ({ _id: id, role: "member" })),
//           ],
//           createdBy: initiatorId,
//         });
//         logger.info(`[CallLogService] Created new chat for call`, {
//           chatId: chat._id,
//         });
//       }

//       if (!chat) {
//         throw new Error("Could not find or create chat for call");
//       }

//       const participants: ICallParticipant[] = [
//         {
//           userId: initiatorId,
//           joinedAt: new Date(),
//           role: "initiator",
//           status: CallStatus.ACCEPTED, // Initiator automatically accepts
//           deviceInfo,
//         },
//         ...receiverIds.map((id) => ({
//           userId: id,
//           joinedAt: new Date(),
//           role: "receiver" as const,
//           status: CallStatus.UNANSWERED,
//         })),
//       ];

//       const callLog = await CallLog.create({
//         chatId: chat._id,
//         callType,
//         state: CallState.ONGOING,
//         participants,
//         startTime: new Date(),
//       });

//       logger.info(`[CallLogService] Created new call log`, {
//         callLogId: callLog._id,
//         chatId: chat._id,
//         callType,
//       });

//       return { callLog, chatId: chat._id };
//     } catch (error) {
//       logger.error(`[CallLogService] Error creating call log:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Update participant status in call log
//    */
//   public static async updateParticipantStatus(
//     callLogId: string,
//     userId: string,
//     status: CallStatus,
//     deviceInfo?: {
//       browser?: string;
//       os?: string;
//       device?: string;
//     }
//   ) {
//     try {
//       const callLog = await CallLog.findById(callLogId);
//       if (!callLog) {
//         throw new Error("Call log not found");
//       }

//       const participant = callLog.participants.find(
//         (p) => p.userId.toString() === userId
//       );
//       if (!participant) {
//         throw new Error("Participant not found in call log");
//       }

//       // Update participant status and device info
//       participant.status = status;
//       if (deviceInfo) {
//         participant.deviceInfo = deviceInfo;
//       }

//       // If accepting call, update join time
//       if (status === CallStatus.ACCEPTED) {
//         participant.joinedAt = new Date();
//       }

//       // If leaving/rejecting/missing call, update left time
//       if (
//         [CallStatus.LEFT, CallStatus.REJECTED, CallStatus.MISSED].includes(
//           status
//         )
//       ) {
//         participant.leftAt = new Date();
//       }

//       // Check if call should be ended
//       const activeParticipants = callLog.participants.filter(
//         (p) =>
//           ![CallStatus.LEFT, CallStatus.REJECTED, CallStatus.MISSED].includes(
//             p.status
//           )
//       );

//       if (activeParticipants.length === 0) {
//         callLog.state = CallState.ENDED;
//         callLog.endTime = new Date();
//       }

//       await callLog.save();

//       logger.info(`[CallLogService] Updated participant status`, {
//         callLogId,
//         userId,
//         status,
//       });

//       return callLog;
//     } catch (error) {
//       logger.error(
//         `[CallLogService] Error updating participant status:`,
//         error
//       );
//       throw error;
//     }
//   }

//   /**
//    * End call and update final state
//    */
//   public static async endCall(
//     callLogId: string,
//     quality?: {
//       avgBitrate?: number;
//       packetLoss?: number;
//       latency?: number;
//     }
//   ) {
//     try {
//       const callLog = await CallLog.findById(callLogId);
//       if (!callLog) {
//         throw new Error("Call log not found");
//       }

//       callLog.state = CallState.ENDED;
//       callLog.endTime = new Date();
//       if (quality) {
//         callLog.quality = quality;
//       }

//       // Update status to LEFT for any active participants
//       callLog.participants.forEach((participant) => {
//         if (
//           ![CallStatus.REJECTED, CallStatus.MISSED].includes(participant.status)
//         ) {
//           participant.status = CallStatus.LEFT;
//           if (!participant.leftAt) {
//             participant.leftAt = new Date();
//           }
//         }
//       });

//       await callLog.save();

//       logger.info(`[CallLogService] Ended call`, {
//         callLogId,
//       });

//       return callLog;
//     } catch (error) {
//       logger.error(`[CallLogService] Error ending call:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Get call logs for a chat
//    */
//   public static async getChatCallLogs(chatId: string) {
//     try {
//       return await CallLog.find({ chatId })
//         .sort({ startTime: -1 })
//         .populate("participants.userId", "username avatar");
//     } catch (error) {
//       logger.error(`[CallLogService] Error getting chat call logs:`, error);
//       throw error;
//     }
//   }

//   /**
//    * Get call logs for a user
//    */
//   public static async getUserCallLogs(userId: string) {
//     try {
//       return await CallLog.find({ "participants.userId": userId })
//         .sort({ startTime: -1 })
//         .populate("participants.userId", "username avatar")
//         .populate("chatId", "name type participants")
//         .lean()
//         .then((logs) => {
//           return logs.map((log) => {
//             const chatInfo = log.chatId as any;

//             return {
//               ...log,
//               chatInfo: {
//                 id: chatInfo._id,
//                 name: chatInfo.type === "group" ? chatInfo.name : undefined,
//                 type: chatInfo.type,
//                 // For individual chats, get the other participant's info
//                 participant:
//                   chatInfo.type === "individual"
//                     ? chatInfo.participants.find(
//                         (p: any) => p._id.toString() !== userId
//                       )
//                     : undefined,
//               },
//             };
//           });
//         });
//     } catch (error) {
//       logger.error(`[CallLogService] Error getting user call logs:`, error);
//       throw error;
//     }
//   }
// }
