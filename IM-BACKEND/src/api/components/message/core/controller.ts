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
import { Types } from "mongoose";
import { MediaHandler } from "@utils/mediaHandler";
import { MulterError } from "multer";
import { MessageEncryptionService } from "@services/helper/messageEncryption";

export default class MessageController {
  /**
   * Get messages for a specific chat
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async getChatMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const chat = await Chat.findOne({
        _id: chatId,
        "participants._id": req.user.id,
      });

      if (!chat) {
        return prepareFailedResponse(
          res,
          ["Chat not found or you are not a participant"],
          statusCodes.NOT_FOUND
        );
      }

      const skip = (Number(page) - 1) * Number(limit);
      const messages = chat.messages
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(skip, skip + Number(limit));


      const decryptedMessages = messages.map((message) => {
        const messageObj = { ...message } as any;
        if (messageObj.text) {
          try {
            messageObj.text = MessageEncryptionService.decryptMessage(
              messageObj.text,
              chat.encryptionKey
            );
          } catch (error) {
            logger.error(`Failed to decrypt message: ${error.message}`);
            messageObj.text = "Message cannot be decrypted";
          }
        }
        return messageObj;
      });

      const customLoggerObj: IAuditLoggerObj = {
        action: "read",
        initiator: {
          _id: req.user.id,
          email: req.user.email,
        },
        targets: [],
      };

      logger.info("Chat messages retrieved successfully", customLoggerObj);
      return prepareSuccessResponse(
        res,
        "Messages retrieved successfully",
        {
          messages: decryptedMessages,
          total: chat.messages.length,
          page: Number(page),
          totalPages: Math.ceil(chat.messages.length / Number(limit)),
        },
        "read"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Mark messages as seen
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async markMessagesSeen(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { chatId } = req.params;
      const { messageIds } = req.body;

      const chat = await Chat.findOne({
        _id: chatId,
        "participants._id": req.user.id,
      });

      if (!chat) {
        return prepareFailedResponse(
          res,
          ["Chat not found or you are not a participant"],
          statusCodes.NOT_FOUND
        );
      }

      const updatedChat = await Chat.findOneAndUpdate(
        { _id: chatId, "messages._id": { $in: messageIds } },
        {
          $addToSet: { "messages.$[elem].seenBy": req.user.id },
          $set: { [`unreadCount.${req.user.id}`]: 0 },
        },
        {
          arrayFilters: [{ "elem._id": { $in: messageIds } }],
          multi: true,
          new: true,
        }
      );

      const customLoggerObj: IAuditLoggerObj = {
        action: "update",
        initiator: {
          _id: req.user.id,
          email: req.user.email,
        },
        targets: [],
      };

      logger.info("Messages marked as seen", customLoggerObj);
      return prepareSuccessResponse(
        res,
        "Messages marked as seen",
        updatedChat,
        "update"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Upload media for a message
   */
  @bind
  public async uploadMedia(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.file) {
        return prepareFailedResponse(
          res,
          ["No file uploaded"],
          statusCodes.BAD_REQUEST
        );
      }

      // Get the type and duration from the request body for voice messages
      const { type, duration } = req.body;

      // Validate duration for voice messages
      if (type === "voice") {
        if (!duration) {
          return prepareFailedResponse(
            res,
            ["Duration is required for voice messages"],
            statusCodes.BAD_REQUEST
          );
        }
        const parsedDuration = parseInt(duration);
        if (isNaN(parsedDuration) || parsedDuration <= 0) {
          return prepareFailedResponse(
            res,
            ["Invalid duration value"],
            statusCodes.BAD_REQUEST
          );
        }
      }

      // Process the uploaded media
      const mediaData = await MediaHandler.processMedia(
        req.file,
        type,
        duration ? parseInt(duration) : undefined
      );

      const message = {
        _id: new Types.ObjectId(),
        senderId: req.user.id,
        text: "",
        timestamp: new Date(),
        seenBy: [],
        isSent: false,
        media: mediaData,
      };

      const customLoggerObj: IAuditLoggerObj = {
        action: "create",
        initiator: {
          _id: req.user.id,
          email: req.user.email,
        },
        targets: [],
      };

      logger.info("Media uploaded successfully", {
        ...customLoggerObj,
        mediaType: type,
        duration: mediaData.duration,
      });

      return prepareSuccessResponse(
        res,
        "Media uploaded successfully",
        mediaData,
        "create"
      );
    } catch (error) {
      logger.error("[MessageController:uploadMedia] Error:", error);

      // Handle Multer errors
      if (error instanceof MulterError) {
        switch (error.code) {
          case "LIMIT_FILE_SIZE":
            return prepareFailedResponse(
              res,
              ["File is too large. Maximum size allowed is 10MB"],
              statusCodes.BAD_REQUEST
            );
          case "LIMIT_UNEXPECTED_FILE":
            return prepareFailedResponse(
              res,
              [
                "Unexpected field name for file upload. Use 'media' as the field name",
              ],
              statusCodes.BAD_REQUEST
            );
          default:
            return prepareFailedResponse(
              res,
              ["Error uploading file: " + error.message],
              statusCodes.BAD_REQUEST
            );
        }
      }

      // Handle specific voice message errors
      if (error.message === "Could not determine voice message duration") {
        return prepareFailedResponse(
          res,
          ["Could not process voice message duration. Please try again."],
          statusCodes.BAD_REQUEST
        );
      }

      // Handle other errors
      return prepareFailedResponse(
        res,
        ["Error uploading file. Please try again."],
        statusCodes.SERVER_ERROR
      );
    }
  }
}
