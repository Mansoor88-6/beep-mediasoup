// /* eslint-disable new-cap */
// /* eslint-disable camelcase */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { bind } from 'decko';
// import { NextFunction, Request, Response } from 'express';
// import User from '@models/components/user/user';
// import UserService from '@services/components/user/user';
// import { UtilityService } from '@services/helper/utility';
// import { prepareFailedResponse, prepareSuccessResponse } from '@api/baseController';
// import { globals, statusCodes } from '@config/globals';
// import { ClientSession } from 'mongoose';
// import { IAuditLoggerObj, UserRole } from '@customTypes/index';
// import { logger } from '@config/logger';

// export default class PasswordController {
//   private readonly userService: UserService = new UserService(User);

//   /**
//    * Change Password
//    *
//    * @param {Request} req Express request
//    * @param {Response} res Express response
//    * @param {NextFunction} next Express next
//    * @returns {Promise<Response | void>} Returns HTTP response
//    */
//   @bind
//   public async changePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
//       let session: ClientSession | null = null;
//       try {
//           const { oldPassword, newPassword } = req.body;
//           const user = await this.userService.model.findById(req.user.id);

//           if (!user) {
//               return prepareFailedResponse(res, [ 'User does not exist!' ], statusCodes.NOT_FOUND);
//           }
//           if (!await UtilityService.comparePlainTextWithHash(oldPassword, user.password)) {
//               return prepareFailedResponse(res, [ 'Invalid Credentials!' ], statusCodes.BAD_REQUEST);
//           }

//           session = await this.userService.model.startSession();
//           session.startTransaction();
//           await User.findByIdAndUpdate(user.id, {
//               $set: {
//                   password: await UtilityService.generatHash(
//                       newPassword, await UtilityService.generateSalt(globals.SALT_LENGTH)),
//                   modified_date: new Date(),
//                   last_password_change: new Date() },
//           }).session(session);
//           await session.commitTransaction();
//           // eslint-disable
//           session.endSession();
//           const customLoggerObj: IAuditLoggerObj = {
//               action: 'update',
//               initiator: {
//                   _id: req.user.id,
//                   email: user.email,
//               },
//               targets: [ {
//                   // eslint-disable-next-line no-underscore-dangle
//                   _id: user?._id || '',
//                   email: user.email,
//               } ]
//           };
//           logger.info('Password Changed Successfully', customLoggerObj)
//           return prepareSuccessResponse(res, 'Password Changed Successfully', undefined, 'update');
//       } catch (err) {
//           if (session && session.inTransaction()) {
//               await session.abortTransaction();
//           }
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//           return next(err && err.response && err.response.data && err.response.data.message ?
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//               new Error(err.response.data.message) : err);
//       }
//   }

//   /**
//    * Change Password
//    *
//    * @param {Request} req Express request
//    * @param {Response} res Express response
//    * @param {NextFunction} next Express next
//    * @returns {Promise<Response | void>} Returns HTTP response
//    */
//   @bind
//   public async overridePassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
//       let session: ClientSession | null = null;
//       try {
//           const { confirmPassword, newPassword, clientId } = req.body;
//           const user = await this.userService.model.findById(clientId);

//           if (!user) {
//               return prepareFailedResponse(res, [ 'User does not exist!' ], statusCodes.NOT_FOUND);
//           }

//           if (newPassword !== confirmPassword) {
//               return prepareFailedResponse(res, [ 'Passwords donot match' ], statusCodes.CONFLICT);
//           }

//           session = await this.userService.model.startSession();
//           session.startTransaction();
//           await User.findByIdAndUpdate(user.id, {
//               $set: {
//                   password: await UtilityService.generatHash(
//                       newPassword, await UtilityService.generateSalt(globals.SALT_LENGTH)),
//                   modified_date: new Date(),
//                   last_password_change: new Date() },
//           }).session(session);
//           await session.commitTransaction();
//           // eslint-disable
//           session.endSession();

//           const customLoggerObj: IAuditLoggerObj = {
//               action: 'update',
//               initiator: {
//                   _id: req.user.id,
//                   email: req?.user?.email,
//               },
//               targets: [ {
//                   // eslint-disable-next-line no-underscore-dangle
//                   _id: user?._id || '',
//                   email: user.email,
//               } ]
//           };
//           logger.info('User password was overridden by admin successfully', customLoggerObj)
//           return prepareSuccessResponse(res, 'Password Changed Successfully', undefined, 'update');
//       } catch (err) {
//           if (session && session.inTransaction()) {
//               await session.abortTransaction();
//           }
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//           return next(err && err.response && err.response.data && err.response.data.message ?
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//               new Error(err.response.data.message) : err);
//       }
//   }

//   /**
//    * Forgot Password
//    *
//    * @param {Request} req Express request
//    * @param {Response} res Express response
//    * @param {NextFunction} next Express next
//    * @returns {Promise<Response | void>} Returns HTTP response
//    */
//   @bind
//   public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
//       try {
//           const { email } = req.body;
//           const lowerCaseEmail = UtilityService.convertToLowercase(email);
//           const user = await this.userService.model.findOne({ email: lowerCaseEmail });
//           if (!user) {
//               return prepareFailedResponse(res, [ 'User does not exist!' ], statusCodes.NOT_FOUND);
//           }
//           const token = this.userService.encodePasswordResetToken(user.id)
//           await this.userService.model.findByIdAndUpdate(user.id,
//               { $set :{
//                   password_reset_token: token } });

//           const customLoggerObj: IAuditLoggerObj = {
//               action: 'update',
//               initiator: {
//                   _id: req.user.id,
//                   email: req?.user?.email,
//               },
//               targets: [ {
//                   // eslint-disable-next-line no-underscore-dangle
//                   _id: user?._id || '',
//                   email: user.email,
//               } ]
//           };
//           logger.info('User forgot password mail sent!', customLoggerObj)
//           return prepareSuccessResponse(res, 'Please check your email.', undefined, 'update');
//       } catch (err) {
//           return next(err);
//       }
//   }


//   /**
//    * Check if token is valid
//    *
//    * @param {Request} req Express request
//    * @param {Response} res Express response
//    * @param {NextFunction} next Express next
//    * @returns {Promise<Response | void>} Returns HTTP response
//    */
//   @bind
//   public async isValidToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
//       try {
//           const { token } = req.body;
//           const { id } = this.userService.decodePasswordResetToken(token)
//           const user = await this.userService.model.findById(id);
//           if (!user) {
//               return prepareFailedResponse(res, [ 'User does not exist!' ], statusCodes.NOT_FOUND);
//           }

//           const customLoggerObj: IAuditLoggerObj = {
//               action: 'read',
//               initiator: {
//                   _id: user.id,
//                   email: user.email,
//               },
//               targets: [ {
//                   // eslint-disable-next-line no-underscore-dangle
//                   _id: user?._id || '',
//                   email: user.email
//               } ]
//           };
//           logger.info('User forgot password token validated!', customLoggerObj)
//           return prepareSuccessResponse(res, 'Token is valid', undefined, 'verify');
//       } catch (err) {
//           return next(err);
//       }
//   }

//   /**
//    * Reset Password
//    *
//    * @param {Request} req Express request
//    * @param {Response} res Express response
//    * @param {NextFunction} next Express next
//    * @returns {Promise<Response | void>} Returns HTTP response
//    */
//   @bind
//   public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
//       let session: ClientSession | null = null;
//       try {
//           const { token, password } = req.body;
//           const { id } = this.userService.decodePasswordResetToken(token)
//           const user = await this.userService.model.findById(id);
//           if (!user) {
//               return prepareFailedResponse(res, [ 'User does not exist!' ], statusCodes.NOT_FOUND);
//           }
//           session = await this.userService.model.startSession();
//           const hashedPassword = await UtilityService.generatHash(
//               password, await UtilityService.generateSalt(globals.SALT_LENGTH));
//           session.startTransaction();
//           await this.userService.model.findByIdAndUpdate(user.id, {
//               $set: { password: hashedPassword, password_reset_token: undefined }
//           }).session(session);
//           await session.commitTransaction();
//           // eslint-disable
//           session.endSession();


//           const customLoggerObj: IAuditLoggerObj = {
//               action: 'update',
//               initiator: {
//                   _id: id,
//                   email: user.email,
//               },
//               targets: [ {
//                   // eslint-disable-next-line no-underscore-dangle
//                   _id: user?._id || '',
//                   email: user.email,
//               } ]
//           };
//           logger.info('User password reset successful!', customLoggerObj)
//           return prepareSuccessResponse(res, 'Password reset successful.', undefined, 'update');
//       } catch (err) {
//           if (session && session.inTransaction()) {
//               await session.abortTransaction();
//           }
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//           return next(err && err.response && err.response.data && err.response.data.message ?
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//               new Error(err.response.data.message) : err);
//       }
//   }

// }
