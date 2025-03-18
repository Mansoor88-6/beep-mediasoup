// import { registerLogging } from './middleware/globals';
// import { registerErrorHandler, registerAntiCsrfProtection } from './middleware/globals';

import { Router } from "express";
// import { registerApiRoutes } from "./components";
import { registerErrorHandler } from "./middleware/globals";

/**
 * Init Express REST routes
 *
 * @param {Router} router Router the routes are attached to
 * @returns {void}
 */
export function initRestRoutes(router: Router): void {
  const prefix = "/api";
  // registerApiRoutes(router, prefix);
  registerErrorHandler(router);
}
