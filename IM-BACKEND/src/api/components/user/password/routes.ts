/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/unbound-method */

import { Router as expressRrouter } from 'express';
import { isAuthenticated, isAuthorized, validateReqBody } from '../../../middleware/locals';
import { check } from 'express-validator';
import { UserRole } from '@customTypes/index';
import PasswordController from './controller';

export default class UserRoutes {
  private readonly controller: PasswordController = new PasswordController();
  public router: expressRrouter = expressRrouter();

  /**
   * Contructor
   */
  public constructor() {
      this.initRoutes();
  }

  /**
   * Init Password routes
   * @returns {void}
   */
  private initRoutes(): void {
      this.router.post('/change-password', [
          check('oldPassword', 'Old password is required').not().isEmpty(),
          check('newPassword', 'New password is required')
              .not()
              .isEmpty()
              .matches(
                  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/
              )
              .withMessage(
                  `New password must be of atleast 8 characters and should include one
                   lowercase character, one uppercase character, a number, and a special character.`
              ),
      ],
      isAuthenticated(),
      isAuthorized([ UserRole.Admin, UserRole.Client]),
      validateReqBody(),
      this.controller.changePassword);

      this.router.post('/password-override', [
          check('newPassword', 'New password is required').not().isEmpty(),
          check('clientId', 'Client is required').not().isEmpty(),
          check('confirmPassword', 'Confirm password is required')
              .not()
              .isEmpty()
              .matches(
                  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/
              )
              .withMessage(
                  `New password must be of atleast 8 characters and should include one
                 lowercase character, one uppercase character, a number, and a special character.`
              ),
      ],
      isAuthenticated(),
      isAuthorized([ UserRole.Admin ]),
      validateReqBody(),
      this.controller.overridePassword);

      this.router.post('/forgot-password',
          [ check('email', 'Email is required').isEmail() ],
          validateReqBody(),
          this.controller.forgotPassword);

      this.router.post('/is-valid-token', [
          check('token', 'token is required').not().isEmpty() ], validateReqBody(),
      this.controller.isValidToken);

      this.router.patch('/reset-password', [
          check('token', 'token is required').not().isEmpty(),
          check('password', 'password is required')
              .not()
              .isEmpty()
              .matches(
                  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/
              )
              .withMessage(
                  `New password must be of atleast 8 characters and should include one lowercase character,
                   one uppercase character, a number, and a special character.`
              ),
      ], validateReqBody(),
      this.controller.resetPassword);
  }

}
