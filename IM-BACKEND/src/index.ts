
// Now import everything else
import "module-alias/register";
import http from "http";
import express from "express";
import Loaders from "@loaders/index";
import { globals } from "@config/globals";

const DEFAULT_PORT = 3300;
const PORT: number =
  ((globals as Record<string, unknown>).SERVER_PORT as number) || DEFAULT_PORT;

const startServer = async () => {
  const app = express();
  const httpServer = http.createServer(app);
  const server = await Loaders(app, httpServer);

  server.startRouter();
  /**
   * Remeber backend api's have greater
   * priority than  uiso therefore, api's
   * should be registered f irst
   */
  server.listen(PORT);
};

startServer();
