// Register module aliases first
import * as path from "path";
import moduleAlias from "module-alias";

// Register aliases based on the directory structure
const baseDir = path.resolve(__dirname);
moduleAlias.addAliases({
  "@config": path.join(baseDir, "config"),
  "@services": path.join(baseDir, "services"),
  "@socket": path.join(baseDir, "socket"),
  "@utils": path.join(baseDir, "utils"),
  "@customTypes": path.join(baseDir, "types"),
});

// Now import everything else
import http from "http";
import express from "express";
import Loaders from "./loaders";
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
