/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/unbound-method */

import { Router as expressRrouter } from 'express';
import { isAuthenticated, isAuthorized, validateReqBody } from '../../../middleware/locals';
import { check } from 'express-validator';
import AuthController from './controller';
import { UserRole } from '@customTypes/index';

export default class AuthRoutes {
  private readonly controller: AuthController = new AuthController();
  public router: expressRrouter = expressRrouter();

  /**
   * Contructor
   */
  public constructor() {
      this.initRoutes();
  }

  /**
   * Init Authorization routes
   * @returns {void}
   */
  private initRoutes(): void {
      this.router.get('/authorization', isAuthenticated(),
          isAuthorized([ UserRole.Admin, UserRole.Client ]),
          this.controller.loadUser);
      this.router.post('/logout',
          isAuthenticated(),
          isAuthorized([ UserRole.Admin, UserRole.Client]),
          this.controller.logout);

      this.router.post('/login', [
          check('email', 'Email is required').isEmail(),
          check('password', 'Password is required').not().isEmpty(),
      ],
      validateReqBody(), this.controller.login);

      this.router.post('/confirm-password', isAuthenticated(),
          isAuthorized([ UserRole.Client, UserRole.Admin ]),
          [
              check('password', 'Password is required').not().isEmpty(),
          ],
          validateReqBody(),
          this.controller.confirmPassword);

  }

}
