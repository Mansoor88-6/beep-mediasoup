import { Request, Response } from "express";
import { CallLogService } from "@services/components/call/callLog";
import { logger } from "@config/logger";

export default class CallController {
  /**
   * Get call logs for the authenticated user
   */
  public getUserCallLogs = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const callLogs = await CallLogService.getUserCallLogs(userId.toString());

      res.status(200).json({
        success: true,
        data: callLogs,
      });
    } catch (error) {
      logger.error("[CallController:getUserCallLogs] Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve user call logs",
      });
    }
  };

  /**
   * Get call logs for a specific chat
   */
  public getChatCallLogs = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { chatId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      // Verify user is a participant of the chat (you may want to move this to a middleware)
      const callLogs = await CallLogService.getChatCallLogs(chatId);

      res.status(200).json({
        success: true,
        data: callLogs,
      });
    } catch (error) {
      logger.error("[CallController:getChatCallLogs] Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve chat call logs",
      });
    }
  };
}
