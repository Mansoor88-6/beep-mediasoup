import { Router } from "express";
import MessageRoutes from "./core/routes";

/**
 * Init Express api routes (Message)
 *
 * @param {Router} router Router the routes are attached to
 * @param {string} prefix Prefix for attached routes
 * @returns {void}
 */
export function registerMessageRoutes(router: Router, prefix = ""): void {
  router.use(`${prefix}/messages`, new MessageRoutes().router);
}
