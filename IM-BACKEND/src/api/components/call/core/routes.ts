import { Router as expressRouter } from "express";
import CallController from "./controller";
import { isAuthenticated } from "@api/middleware/locals";
import { check } from "express-validator";

export default class CallLogsRoutes {
  private readonly controller: CallController = new CallController();
  public router: expressRouter = expressRouter();

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
    // Get call logs for authenticated user
    this.router.get(
      "/logs",
      isAuthenticated(),
      this.controller.getUserCallLogs
    );

    // Get call logs for a specific chat
    this.router.get(
      "/logs/chat/:chatId",
      isAuthenticated(),
      [check("chatId").isMongoId().withMessage("Invalid chat ID")],
      this.controller.getChatCallLogs
    );
  }
}
