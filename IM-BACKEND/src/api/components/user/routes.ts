
import { Router } from 'express';
import UserAuthRoutes from './authorization/routes';
import UserCoreRoutes from './core/routes';
import UserPasswordRoutes from './password/routes';

/**
 * Init Express api routes (User)
 *
 * @param {Router} router Router the routes are attached to
 * @param {string} prefix Prefix for attached routes
 * @returns {void}
 */
export function registerUserRoutes(router: Router, prefix = ''): void {
    router.use(`${prefix}/user`, new UserAuthRoutes().router);
    router.use(`${prefix}/user`, new UserPasswordRoutes().router);

    /**
     * User core routes, it has wildcard so make it
     * at last
     */
    router.use(`${prefix}/user`, new UserCoreRoutes().router);
}
