import cors from "cors";
import { Server } from "http";
import express, { Request } from "express";
import { globals } from "@config/globals";
import { logger } from "@config/logger";

// eslint-disable-next-line no-unused-vars
type originCallback = (
  err: Error | null,
  origin?: Record<
    string,
    boolean | string | RegExp | (boolean | string | RegExp)[]
  >
) => void;

export default class ExpressLoader {
  public app: express.Application;
  public httpServer: Server;

  /**
   * Constructor
   * @param {express.Application} app Express Application
   * @param {Server} httpServer Express Application
   */
  constructor(app: express.Application, httpServer: Server) {
    this.app = app;
    this.httpServer = httpServer;
    this.initializeControllers();
  }

  public listen = (port: number): void => {
    this.httpServer.listen(port, () => {
      logger.info(`🚀 Mediasoup server listening on port : ${port}`);
    });
  };

  /**
   * Start router api's
   * @returns {void}
   */
  public startRouter(): void {
    // WebRTC routes will be added here
  }

  /**
   * Remove following apis from cors UI
   * @param {Request} req incoming request
   * @param {originCallback} callback Port binding
   * @returns {void}
   */
  public exceptionCORS = (req: Request, callback: originCallback): void => {
    const origin = req.header("Origin");
    const corsOptions = { origin: true, credentials: true };

    if (!origin) {
      corsOptions.origin = false;
    } else {
      const foundInAllowedDomains = globals.CORS.some((org) => origin === org);
      if (!foundInAllowedDomains) {
        return callback(
          new Error("CORS not allowed for this origin"),
          corsOptions
        );
      }
    }
    return callback(null, corsOptions);
  };

  /**
   * Initializes urls
   * @param {number} port Port binding
   * @returns {void}
   */
  public async initializeControllers(): Promise<void> {
    this.app.use(cors(this.exceptionCORS));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }
}
