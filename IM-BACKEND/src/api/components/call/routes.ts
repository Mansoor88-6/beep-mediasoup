import { Router } from "express";
import CallLogsRoutes from "./core/routes";


/**
 * Init Express api routes (Call Logs)
 *
 * @param {Router} router Router the routes are attached to
 * @param {string} prefix Prefix for attached routes
 * @returns {void}
 */

export function registerCallLogsRoutes(router: Router, prefix = ""): void {
  router.use(`${prefix}/calls`, new CallLogsRoutes().router);
}
