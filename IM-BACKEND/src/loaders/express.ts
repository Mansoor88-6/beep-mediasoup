import cors from "cors";
import path from "path";
import { Server } from "http";
import cookieParser from "cookie-parser";
import express, { Request } from "express";
import { globals } from "@config/globals";
import { initRestRoutes } from "@api/routes";
import { logger, requestLogger } from "@config/logger";
import { MediaHandler } from "@utils/mediaHandler";

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
      logger.info(`🚀 App listening on port : ${port}`);
    });
  };

  /**
   * Start router api's
   * @returns {void}
   */
  public startRouter(): void {
    initRestRoutes(this.app);
  }

  /**
   * Serve UI
   * @returns {void}
   */
  public serveFrontEnd(): void {
    this.app.use(express.static("IM-FRONTEND/build"));
    this.app.get("*", (req, res) => {
      return res.sendFile(
        path.resolve(process.cwd(), "IM-FRONTEND", "build", "index.html")
      );
    });
  }

  /**
   * Remove following apis from cors UI
   * @param {Request} req incoming request
   * @param {originCallback} callback Port binding
   * @returns {void}
   */
  public exceptionCORS = (req: Request, callback: originCallback): void => {
    const origin = req.header("Origin");

    /**
     * here will be those apis will remove from cors
     * so origin header comes up.
     */
    const ignoreEndpoints: string[] = []; // Example paths to ignore
    const corsOptions = { origin: true, credentials: true };
    if (!origin) {
      /**
       * If there is no origin header then it
       * means that REST apis are being called
       * so allow it.
       */
      corsOptions.origin = false;
    } else {
      const foundInAllowedDomains = globals.CORS.some((org) => {
        return origin === org;
      });

      /**
       * Commented following whitelisting as agent
       * requests doesnot have Origin header and works fine
       */
      const foundInWhitelistedUrls = ignoreEndpoints.some((end) => {
        return req.originalUrl.search(end) !== globals.NOT_FOUND;
      });
      if (!foundInAllowedDomains && !foundInWhitelistedUrls) {
        // Disallow CORS for other origins
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
    this.app.use(cookieParser());
    this.app.use(cors(this.exceptionCORS));
    // cors({
    //   origin: "*",
    //   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    // })

    this.app.use(express.json({ limit: "80mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "80mb" }));
    this.app.use(requestLogger);

    // Initialize MediaHandler
    await MediaHandler.init();

    // Serve static files from uploads directory
    this.app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "uploads"))
    );
  }
}
