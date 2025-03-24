import express from "express";
import { Server } from "http";
import ExpressLoader from "./express";
import { logger } from "@config/logger";
import SocketServer from "@socket/socketServer";

export default async (
  app: express.Application,
  httpServer: Server
): Promise<ExpressLoader> => {
  const socketServer = SocketServer.getInstance(httpServer);
  const expressInstance = new ExpressLoader(app, httpServer);
  logger.info("🚀 Express Initialized!");
  await socketServer.connect();
  logger.info("🚀 Socket Initialized!");
  return expressInstance;
};
