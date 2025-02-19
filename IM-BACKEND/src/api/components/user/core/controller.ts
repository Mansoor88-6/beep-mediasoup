/* eslint-disable init-declarations */
/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import UserService from "@services/components/user/user";
import User from "@models/components/user/user";
import UserAccountService from "@services/components/user/userAccount";

import {
  prepareFailedResponse,
  prepareSuccessResponse,
} from "@api/baseController";
import { branding, globals, statusCodes } from "@config/globals";
import { logger } from "@config/logger";
import { UtilityService } from "@services/helper/utility";
import { ClientSession } from "mongoose";
// import moment from 'moment';

import { IAuditLoggerObj, UserRole } from "@customTypes/index";

export default class UserController {
  private readonly userService: UserService = new UserService(User);
  private readonly userAccountService: UserAccountService =
    new UserAccountService(User);

  /**
   * Register Organization
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const {
        username,
        email,
        //   address,
        //   organization,
      } = req.body;
      //   const one = 1;
      const password = this.userService.generateUserPassword();
      //   const startDate = new Date();
      //   const expiryDate = moment(startDate).add(one, 'years').toDate();
      const admin = await this.userService.model.findOne({
        role: UserRole.Admin,
      });
      if (!admin) {
        return prepareFailedResponse(
          res,
          ["contact on this email contact@averox.com!"],
          statusCodes.NOT_FOUND
        );
      }

      /**
       * if Client tries to send request with mssp true
       * throw error
       */
      if (req.user.role === UserRole.Client) {
        return prepareFailedResponse(
          res,
          ["You are not authorized to perform this action"],
          statusCodes.FORBIDDEN
        );
      }

      const user = await this.userAccountService.registerAccount(
        username,
        email,
        //   address,
        //   organization,
        //   req.user.id,
        password,
        true
      );
      if (!user) {
        return prepareFailedResponse(
          res,
          ["Account could not be created!"],
          statusCodes.NOT_FOUND
        );
      }

      const customLoggerObj: IAuditLoggerObj = {
        action: "create",
        initiator: {
          _id: req.user.id,
          email: req?.user?.email,
        },
        targets: [
          {
            // eslint-disable-next-line no-underscore-dangle
            _id: user?._id || "",
            email: user?.email,
          },
        ],
      };
      logger.info(
        "Oraganization registered successfully. You will recieve an email shortly!",
        customLoggerObj
      );
      return prepareSuccessResponse(
        res,
        "Oraganization registered successfully. You will recieve an email shortly!",
        user,
        "create"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Generate random password
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async generateRandomPassword(
    req: Request,
    res: Response
  ): Promise<Response | void> {
    const password = this.userService.generateUserPassword();
    const hashed = await UtilityService.generatHash(
      password,
      await UtilityService.generateSalt(globals.SALT_LENGTH)
    );

    return prepareSuccessResponse(
      res,
      "Random passwords generated successfully",
      {
        password: password,
        hashed: hashed,
      }
    );
  }

  /**
   * User register
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async signUp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const {
        username,
        //   address,
        //   organization,
        email,
        password,
        confirmPassword,
      } = req.body;
      //   const startDate = new Date();
      //   const seven = 7;
      //   const balance = 0;
      //   const trialExpiry = moment(startDate).add(seven, 'days').toDate();
      if (password !== confirmPassword) {
        return prepareFailedResponse(
          res,
          ["Password not match!"],
          statusCodes.NOT_FOUND
        );
      }
      //   const admin = await this.userService.model.findOne({
      //       role: UserRole.Admin,
      //   });
      //   if (!admin) {
      //       return prepareFailedResponse(
      //           res,
      //           [ 'contact on this email beep@averox.com!' ],
      //           statusCodes.NOT_FOUND
      //       );
      //   }

      const user = await this.userAccountService.registerAccount(
        username,
        email,
        //   address,
        //   organization,
        //   req.user.id,
        password,
        true
      );
      if (!user) {
        return prepareFailedResponse(
          res,
          ["Account could not be created!"],
          statusCodes.NOT_FOUND
        );
      }
      return prepareSuccessResponse(
        res,
        "Account registered successfully. You will recieve an email shortly!",
        user,
        "create"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Update Organization
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    let session: ClientSession | null = null;
    const { role, id } = req.user;
    const { clientId } = req.params;
    const zero = 0;
    console.log(clientId, id, req.body);
    const { username, userRole, email, activate } = req.body;
    const lowerCaseEmail = UtilityService.convertToLowercase(email);

    try {
      /**
       * If transaction has some issues (e.g validation issues)
       * It will not be saved as it will give eror and session
       * will not be ended properly.
       */
      session = await this.userService.model.startSession();
      session.startTransaction();
      let data: unknown = {};

      const user = await this.userService.model
        .findById(clientId)
        .select("email created_by");

      if (!user) {
        return prepareFailedResponse(
          res,
          ["User does not exist!"],
          statusCodes.NOT_FOUND
        );
      }
      const customLoggerObj: IAuditLoggerObj = {
        action: "update",
        initiator: {
          _id: req.user.id,
          email: req?.user?.email,
        },
        targets: [
          {
            // eslint-disable-next-line no-underscore-dangle
            _id: user?._id || "",
            email: user?.email,
          },
        ],
      };

      /**
       * If
       * 1) user is not admin
       * 2) User is not created by current user req.user
       * then user is unauthorized to update otp for clientId
       */
      if (
        role !== UserRole.Admin &&
        user
        // user.created_by?.toString() !== id &&
        // user.id !== id
      ) {
        logger.info(
          "Unauthorized attempt to update user otp status",
          customLoggerObj
        );
        return prepareFailedResponse(
          res,
          ["You are unauthorized to perform this operation!"],
          statusCodes.FORBIDDEN
        );
      }

      /**
       * Associate this query with the
       * ongoing transaction session.
       */
      const modifiedUser = await this.userService.model
        .findByIdAndUpdate(
          clientId,
          {
            $set: {
              username: username,
              email: lowerCaseEmail,
              activate: activate,
              role: userRole,
              failed_login_attempts:
                activate === true ? zero : user.failed_login_attempts,
            },
          },
          { runValidators: true, new: true }
        )
        .select("username activate email role avatar")
        .session(session);

      data = modifiedUser;

      /**
       * Complete db transaction.
       */
      await session.commitTransaction();
      session.endSession();
      logger.info("Organization updated successfully!", customLoggerObj);
      return prepareSuccessResponse(
        res,
        "Organization updated successfully!",
        data,
        "update"
      );
    } catch (err) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return next(
        err && err.response && err.response.data && err.response.data.message
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            new Error(err.response.data.message)
          : err
      );
    }
  }

  /**
   * Update User Profile
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async updateUserProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const { firstName, lastName, address } = req.body;
    try {
      const user = await this.userService.model
        .findByIdAndUpdate(
          req.user.id,
          {
            $set: {
              first_name: firstName,
              last_name: lastName,
              address: address,
              // otp_enabled: otpEnabled,
              modified_date: new Date(),
            },
          },
          { new: true }
        )
        .select("-password -password_reset_token");
      if (!user) {
        return prepareFailedResponse(
          res,
          ["User does not exist!"],
          statusCodes.NOT_FOUND
        );
      }
      const completeUser = {
        ...user,
      };
      const customLoggerObj: IAuditLoggerObj = {
        action: "update",
        initiator: {
          _id: req.user.id,
          email: req?.user?.email,
        },
        targets: [
          {
            // eslint-disable-next-line no-underscore-dangle
            _id: user._id || "",
            email: user.email,
          },
        ],
      };
      logger.info("Profile updated successfully!", customLoggerObj);
      return prepareSuccessResponse(
        res,
        "Profile updated successfully!",
        completeUser,
        "update"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Update User Profile
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async updateUserAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      /**
       * As i have used "single" in multer
       * local middleware so req.files will be
       * empty and file will always come in req.file
       */
      const file = req.file;
      if (!file) {
        return prepareFailedResponse(
          res,
          ["Image not uploaded!"],
          statusCodes.BAD_REQUEST
        );
      }

      const oldAvatar = await this.userService.model
        .findById(req.user.id)
        .select("avatar avatar_file_name");
      const avatarUrl = (file as unknown as Record<string, string>).url;
      const avatarFileName = (file as unknown as Record<string, string>)
        .blobName;

      const user = await this.userService.model
        .findByIdAndUpdate(
          req.user.id,
          {
            $set: {
              avatar: avatarUrl,
              avatar_file_name: avatarFileName,
              modified_date: new Date(),
            },
          },
          { new: true }
        )
        .select("-password -password_reset_token");

      if (!user) {
        return prepareFailedResponse(
          res,
          ["User does not exist!"],
          statusCodes.NOT_FOUND
        );
      }

      const customLoggerObj: IAuditLoggerObj = {
        action: "update",
        initiator: {
          _id: req.user.id,
          email: req?.user?.email,
        },
        targets: [
          {
            // eslint-disable-next-line no-underscore-dangle
            _id: user._id || "",
            email: user.email,
          },
        ],
      };
      logger.info("Profile updated successfully!", customLoggerObj);

      return prepareSuccessResponse(
        res,
        "Profile updated successfully!",
        { avatar: avatarUrl },
        "update"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Get All users
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const users = await this.userService.model
        .find()
        .sort({ date: -1 })
        .select("username email role activate avatar");

      /**
       * Subscription.toJSON is required
       * so that decimal is properly converted
       */
      const data = users?.map((user) => {
        const obj: Record<string, unknown> = {
          ...user.toObject(),
        };
        return obj;
      });
      return prepareSuccessResponse(
        res,
        "Got all users successfully",
        data,
        "read"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Delete user
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    let session: ClientSession | null = null;
    try {
      const { userIds } = req.body;
      const admin = await this.userService.model.findOne({
        role: UserRole.Admin,
      });
      if (!admin) {
        return prepareFailedResponse(
          res,
          [`contact on this email ${branding.BRAND_CONTACT_EMAIL}!`],
          statusCodes.NOT_FOUND
        );
      }

      let users = await this.userService.model.find({ _id: { $in: userIds } });
      if (users.length !== (userIds as Array<string>).length) {
        return prepareFailedResponse(
          res,
          ["Some of User does not exist!"],
          statusCodes.NOT_FOUND
        );
      }

      /**
       * Filter out users owned by the current user
       * in case they are not admin
       */
      if (req.user.role !== UserRole.Admin) {
        users = users.filter((user) => {
          return user.created_by?.toString() === req.user.id.toString();
        });
        if (users.length !== (userIds as Array<string>).length) {
          return prepareFailedResponse(
            res,
            ["Unauthorized access, cannot delete some users"],
            statusCodes.FORBIDDEN
          );
        }
      }

      // delete all the subscription of user

      session = await this.userService.model.startSession();
      session.startTransaction();
      await this.userService.model
        .deleteMany({ _id: { $in: userIds } })
        .session(session);

      /**
       * Complete db transaction.
       */
      await session.commitTransaction();
      session.endSession();

      const customLoggerObj: IAuditLoggerObj = {
        action: "delete",
        initiator: {
          _id: req.user.id,
          email: req?.user?.email,
        },
        targets: users.map((user) => {
          return {
            _id: user._id,
            email: user.email,
          };
        }),
      };
      logger.info("Users deleted successfully!", customLoggerObj);

      return prepareSuccessResponse(
        res,
        "Selected Users deleted successfully!",
        userIds,
        "delete"
      );
    } catch (err) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }
      return next(err);
    }
  }

  /**
   * Get available chat participants
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async getChatParticipants(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      logger.info("[Users] Fetching available chat participants", {
        requestingUserId: req.user.id,
      });

      // Get all active users except the current user
      const users = await this.userService.model
        .find({
          _id: { $ne: req.user.id }, // Exclude current user
          activate: true, // Only active users
        })
        .select("username avatar _id email") // Only needed fields
        .sort({ username: 1 }); // Sort by username

      const customLoggerObj: IAuditLoggerObj = {
        action: "read",
        initiator: {
          _id: req.user.id,
          email: req.user.email,
        },
        targets: [],
      };

      logger.info("[Users] Successfully fetched chat participants", {
        count: users.length,
        ...customLoggerObj,
      });

      return prepareSuccessResponse(
        res,
        "Available chat participants retrieved successfully",
        users,
        "read"
      );
    } catch (err) {
      logger.error("[Users] Error fetching chat participants:", err);
      return next(err);
    }
  }
}
