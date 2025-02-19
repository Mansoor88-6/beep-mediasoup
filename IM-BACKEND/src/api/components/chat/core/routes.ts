import { Router as expressRrouter } from "express";
import ChatController from "./controller";
import { isAuthenticated } from "@api/middleware/locals";
import { check } from "express-validator";

export default class ChatRoutes {
  private readonly controller: ChatController = new ChatController();
  public router: expressRrouter = expressRrouter();

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
    this.router.post(
      "/create",
      isAuthenticated(),
      check("participantId")
        .notEmpty()
        .withMessage("Participant ID is required"),
      this.controller.createChat
    );

    this.router.post(
      "/group",
      isAuthenticated(),
      [
        check("name").notEmpty().withMessage("Group name is required"),
        check("participantIds")
          .isArray()
          .withMessage("Participant IDs must be an array")
          .notEmpty()
          .withMessage("At least one participant is required"),
      ],
      this.controller.createGroupChat
    );

    this.router.post(
      "/group/:chatId/participants",
      isAuthenticated(),
      [
        check("chatId").isMongoId().withMessage("Invalid chat ID"),
        check("participantIds")
          .isArray()
          .withMessage("Participant IDs must be an array")
          .notEmpty()
          .withMessage("At least one participant is required"),
      ],
      this.controller.addGroupParticipants
    );

    this.router.get("/", isAuthenticated(), this.controller.getUserChats);
  }
}
