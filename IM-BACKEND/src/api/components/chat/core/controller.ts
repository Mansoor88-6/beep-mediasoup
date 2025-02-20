import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import {
  prepareFailedResponse,
  prepareSuccessResponse,
} from "@api/baseController";
import { statusCodes } from "@config/globals";
import { logger } from "@config/logger";
import { IAuditLoggerObj } from "@customTypes/index";
import Chat from "@models/components/chat/chat";
import User from "@models/components/user/user";
import { MessageEncryptionService } from "@services/helper/messageEncryption";
import SocketIO from "@socket/socketServer";
import { events } from "@socket/events";

export default class ChatController {
  /**
   * Create a new chat between two users
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async createChat(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { participantId } = req.body;

      // Check if participant exists
      const participant = await User.findById(participantId).select(
        "username avatar"
      );

      const user = await User.findById(req.user.id).select("username avatar");
      if (!participant) {
        return prepareFailedResponse(
          res,
          ["Participant user does not exist!"],
          statusCodes.NOT_FOUND
        );
      }

      const existingChat = await Chat.findOne({
        type: "individual",
        "participants._id": {
          $all: [req.user.id, participantId],
        },
      });

      if (existingChat) {
        const chatObject = existingChat.toObject() as Record<string, any>;
        delete chatObject.encryptionKey;
        return prepareSuccessResponse(
          res,
          "Chat already exists",
          chatObject,
          "read"
        );
      }

      // Generate a unique encryption key for the chat
      const encryptionKey = MessageEncryptionService.generateChatKey();

      const chat = await Chat.create({
        type: "individual",
        participants: [
          {
            _id: req.user.id,
            username: user?.username,
            avatar: user?.avatar,
            role: "member",
          },
          {
            _id: participant._id,
            username: participant.username,
            avatar: participant.avatar,
            role: "member",
          },
        ],
        messages: [],
        lastMessage: null,
        unreadCount: {
          [req.user.id]: 0,
          [participant._id]: 0,
        },
        createdBy: req.user.id,
        encryptionKey,
      });

      const customLoggerObj: IAuditLoggerObj = {
        action: "create",
        initiator: {
          _id: req.user.id,
          email: req.user.email,
        },
        targets: [
          {
            _id: participant._id,
            email: participant.email,
          },
        ],
      };

      logger.info("Individual chat created successfully", customLoggerObj);

      // Return chat without encryption key
      const chatObject = chat.toObject() as Record<string, any>;
      delete chatObject.encryptionKey;

      return prepareSuccessResponse(
        res,
        "Chat created successfully",
        chatObject,
        "create"
      );
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Create a new group chat
   */
  @bind
  public async createGroupChat(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { name, description, participantIds } = req.body;

      // Validate minimum participants
      if (!Array.isArray(participantIds) || participantIds.length < 1) {
        return prepareFailedResponse(
          res,
          ["At least one participant is required"],
          statusCodes.BAD_REQUEST
        );
      }

      const allParticipantIds = [
        req.user.id,
        ...participantIds.filter((id) => id !== req.user.id),
      ];
      const participants = await User.find({
        _id: { $in: allParticipantIds },
      }).select("username avatar");

      if (participants.length !== allParticipantIds.length) {
        return prepareFailedResponse(
          res,
          ["One or more participants do not exist"],
          statusCodes.NOT_FOUND
        );
      }

      // Generate a unique encryption key for the group chat
      const encryptionKey = MessageEncryptionService.generateChatKey();

      const chat = await Chat.create({
        type: "group",
        name,
        description,
        participants: participants.map((p) => ({
          _id: p._id,
          username: p.username,
          avatar: p.avatar,
          role: p._id.toString() === req.user.id ? "admin" : "member",
        })),
        messages: [],
        lastMessage: null,
        unreadCount: Object.fromEntries(
          participants.map((p) => [p._id.toString(), 0])
        ),
        createdBy: req.user.id,
        encryptionKey,
      });

      const chatObject = chat.toObject() as Record<string, any>;
      delete chatObject.encryptionKey;
      const onlineUsers = SocketIO.onlineUsers;

      participants.forEach((participant) => {
        const participantId = participant._id.toString();
        if (participantId !== req.user.id) {
          // Get socket ID directly since participantId is the key in the Map
          const socketId = onlineUsers.get(participantId);
          if (socketId) {
            SocketIO.io.to(socketId).emit(events.CREATE_GROUP, {
              chat: chatObject,
            });
          }
        }
      });

      const customLoggerObj: IAuditLoggerObj = {
        action: "create",
        initiator: {
          _id: req.user.id,
          email: req.user.email,
        },
        targets: participants
          .filter((p) => p._id.toString() !== req.user.id)
          .map((p) => ({
            _id: p._id,
            email: p.email,
          })),
      };

      return prepareSuccessResponse(
        res,
        "Group chat created successfully",
        chatObject,
        "create"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Get all chats for the current user
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async getUserChats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { type } = req.query;
      const query: any = {
        "participants._id": req.user.id,
      };

      if (type && ["individual", "group"].includes(type as string)) {
        query.type = type;
      }

      const chats = await Chat.find(query).sort({ updatedAt: -1 });

      // Decrypt messages for each chat
      const decryptedChats = chats.map((chat) => {
        const chatObj: { encryptionKey?: string; [key: string]: any } =
          chat.toObject();

        // Decrypt messages
        if (chatObj.messages && chatObj.messages.length > 0) {
          chatObj.messages = chatObj.messages.map((message: any) => {
            // Decrypt text if present
            if (message.text) {
              try {
                message.text = MessageEncryptionService.decryptMessage(
                  message.text,
                  chatObj.encryptionKey!
                );
              } catch (error) {
                logger.error(`Failed to decrypt message: ${error.message}`);
                message.text = "Message cannot be decrypted";
              }
            }
            return message;
          });
        }

        // Remove encryption key from response
        delete chatObj.encryptionKey;
        return chatObj;
      });

      const customLoggerObj: IAuditLoggerObj = {
        action: "read",
        initiator: {
          _id: req.user.id,
          email: req.user.email,
        },
        targets: [],
      };

      logger.info("User chats retrieved successfully", customLoggerObj);
      return prepareSuccessResponse(
        res,
        "Chats retrieved successfully",
        decryptedChats,
        "read"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Add participants to a group chat
   */
  @bind
  public async addGroupParticipants(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { chatId } = req.params;
      const { participantIds } = req.body;

      const chat = await Chat.findOne({
        _id: chatId,
        type: "group",
        "participants._id": req.user.id,
        "participants.role": "admin",
      });

      if (!chat) {
        return prepareFailedResponse(
          res,
          ["Chat not found or you don't have permission"],
          statusCodes.NOT_FOUND
        );
      }

      // Get new participants
      const existingParticipantIds = chat.participants.map((p) => p._id);
      const newParticipants = await User.find({
        $and: [
          { _id: { $in: participantIds } },
          { _id: { $nin: existingParticipantIds } },
        ],
      }).select("username avatar");

      if (!newParticipants.length) {
        return prepareFailedResponse(
          res,
          ["No new participants to add"],
          statusCodes.BAD_REQUEST
        );
      }

      const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
          $push: {
            participants: {
              $each: newParticipants.map((p) => ({
                _id: p._id,
                username: p.username,
                avatar: p.avatar,
                role: "member",
              })),
            },
          },
          $set: newParticipants.reduce(
            (acc, p) => ({ ...acc, [`unreadCount.${p._id}`]: 0 }),
            {}
          ),
        },
        { new: true }
      );

      const customLoggerObj: IAuditLoggerObj = {
        action: "update",
        initiator: {
          _id: req.user.id,
          email: req.user.email,
        },
        targets: newParticipants.map((p) => ({
          _id: p._id,
          email: p.email,
        })),
      };

      logger.info("Participants added to group chat", customLoggerObj);
      return prepareSuccessResponse(
        res,
        "Participants added successfully",
        updatedChat,
        "update"
      );
    } catch (err) {
      return next(err);
    }
  }
}
