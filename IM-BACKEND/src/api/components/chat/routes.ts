
import { Router } from 'express';
import ChatRoutes from './core/routes';

/**
 * Init Express api routes (User)
 *
 * @param {Router} router Router the routes are attached to
 * @param {string} prefix Prefix for attached routes
 * @returns {void}
 */
export function registerChatRoutes(router: Router, prefix = ''): void {
    router.use(`${prefix}/chats`, new ChatRoutes().router);
}
