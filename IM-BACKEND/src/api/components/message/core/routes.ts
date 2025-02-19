import { Router as expressRouter } from "express";
import MessageController from "./controller";
import { isAuthenticated } from "@api/middleware/locals";
import { check } from "express-validator";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { logger } from "@config/logger";

export default class MessageRoutes {
  private readonly controller: MessageController = new MessageController();
  public router: expressRouter = expressRouter();
  private readonly uploadDir = path.join(process.cwd(), "uploads");

  // Configure multer for media uploads
  private storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(this.uploadDir)) {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      }
      cb(null, this.uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with original extension
      const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueFilename);
    },
  });

  private upload = multer({
    storage: this.storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept images, videos, documents, and audio files
      const allowedMimes = [
        // Images
        "image/jpeg",
        "image/png",
        "image/gif",
        // Videos
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        // Audio
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/webm", // Add support for WebM audio
        // Documents
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        logger.error("Invalid file type attempted:", {
          filename: file.originalname,
          mimetype: file.mimetype,
        });
        cb(
          new Error(
            `Invalid file type. Only ${allowedMimes.join(", ")} are allowed`
          )
        );
      }
    },
  });

  /**
   * Constructor
   */
  public constructor() {
    this.initRoutes();
  }

  /**
   * Initialize routes
   */
  private initRoutes(): void {
    // this.router.post(
    //   "/chats/:chatId/messages",
    //   isAuthenticated(),
    //   [
    //     check("text").notEmpty().withMessage("Message text is required"),
    //     check("receiverId").notEmpty().withMessage("Receiver ID is required"),
    //     check("chatId").isMongoId().withMessage("Invalid chat ID"),
    //   ],
    //   this.controller.sendMessage
    // );

    this.router.get(
      "/chats/:chatId/messages",
      isAuthenticated(),
      check("chatId").isMongoId().withMessage("Invalid chat ID"),
      this.controller.getChatMessages
    );

    this.router.put(
      "/chats/:chatId/messages/seen",
      isAuthenticated(),
      check("chatId").isMongoId().withMessage("Invalid chat ID"),
      this.controller.markMessagesSeen
    );

    // Upload media for a message
    this.router.post(
      "/upload",
      isAuthenticated(),
      (req, res, next) => {
        this.upload.single("media")(req, res, (err) => {
          if (err) {
            logger.error("File upload error:", err);
            if (err instanceof multer.MulterError) {
              if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                  success: false,
                  messages: ["File is too large. Maximum size allowed is 10MB"],
                });
              }
            }
            return res.status(400).json({
              success: false,
              messages: [err.message],
            });
          }
          next();
        });
      },
      this.controller.uploadMedia
    );
  }
}
