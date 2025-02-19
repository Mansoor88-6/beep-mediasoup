/* eslint-disable no-underscore-dangle */
/* eslint-disable new-cap */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { v4 } from "uuid";
import { bind } from "decko";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "@services/auth";
import User from "@models/components/user/user";
import UserService from "@services/components/user/user";
import { logger } from "@config/logger";
import { globals, statusCodes } from "@config/globals";
import { UtilityService } from "@services/helper/utility";
import { IAuditLoggerObj, UserRole } from "@customTypes/index";
import {
  prepareFailedResponse,
  prepareSuccessResponse,
} from "@api/baseController";

export default class AuthController {
  private readonly userService: UserService = new UserService(User);
  private readonly authService: AuthService = new AuthService();

  /**
   * User login
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const one = 1;
      const zero = 0;
      const { email, password } = req.body;
      const lowerCaseEmail = UtilityService.convertToLowercase(email);
      console.log("lowerCaseEmail", lowerCaseEmail);
      const user = await this.userService.model
        .findOne({ email: lowerCaseEmail })
        .populate("created_by");
      console.log("fins ", user);
      if (!user) {
        return prepareFailedResponse(
          res,
          ["User does not exist!"],
          statusCodes.NOT_FOUND
        );
      }
      console.log("user", user);
      const customLoggerObj: IAuditLoggerObj = {
        action: "create",
        initiator: {
          _id: user._id,
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
      if (user.activate === false) {
        logger.error("User account not active", customLoggerObj);
        return prepareFailedResponse(
          res,
          ["Account not active!"],
          statusCodes.NOT_FOUND
        );
      }

      if (
        !(await UtilityService.comparePlainTextWithHash(
          password,
          user.password
        ))
      ) {
        // here will increment the counter and will de-activate the account if the attempts are 5
        const updatedUser = await this.userService.model.findByIdAndUpdate(
          user.id,
          {
            $inc: { failed_login_attempts: one },
            $set: {
              activate:
                Number(user?.failed_login_attempts) + one <
                globals.FAILED_LOGIN_ATTEMPTS_ALLOWED,
            }, // If this is the 5th attempt, disable the account
          },
          { new: true }
        );
        if (!updatedUser?.activate) {
          logger.error(
            "Account is disabled due to multiple failed attempts",
            customLoggerObj
          );
          return prepareFailedResponse(
            res,
            [
              "Account is disabled due to multiple failed attempts. Please contact admin",
            ],
            statusCodes.FORBIDDEN
          );
        }
        logger.error(
          "Invalid credentials attempt on user account",
          customLoggerObj
        );
        return prepareFailedResponse(
          res,
          ["Invalid Credentials!"],
          statusCodes.BAD_REQUEST
        );
      }

      // here we will reset the counter for the false attempts.
      // only making db request if it's not 0 to avoid database calls on every login attempt.
      if (user.failed_login_attempts !== zero) {
        await this.userService.model.findByIdAndUpdate(user.id, {
          $set: { failed_login_attempts: zero },
        });
      }

      // Generate tokens using simplified approach
      const accessToken = this.authService.createAccessToken(user);
      const refreshToken = this.authService.createRefreshToken();

      // Set cookies with the tokens directly
      res.cookie("accessToken", accessToken, globals.cookieOptions);
      res.cookie("refreshToken", refreshToken, {
        ...globals.cookieOptions,
        httpOnly: false,
      });

      logger.info("User logged in successfully!", customLoggerObj);
      return prepareSuccessResponse(
        res,
        "user logged in successfully!",
        {
          role: user.role,
          accessToken,
          refreshToken,
        },
        "verify"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Send Otp
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async confirmPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id, email } = req.user;
      const { password } = req.body;
      const user = await this.userService.model.findById(id);
      if (!user) {
        return prepareFailedResponse(
          res,
          ["User does not exist!"],
          statusCodes.NOT_FOUND
        );
      }
      if (
        !(await UtilityService.comparePlainTextWithHash(
          password,
          user.password
        ))
      ) {
        const customLoggerObj: IAuditLoggerObj = {
          action: "create",
          initiator: {
            _id: id,
            email: email,
          },
          targets: [
            {
              // eslint-disable-next-line no-underscore-dangle
              _id: user?._id || "",
              email: user?.email,
            },
          ],
        };
        logger.error(
          "Invalid credential attempt for user password",
          customLoggerObj
        );
        return prepareFailedResponse(
          res,
          ["Invalid Credentials!"],
          statusCodes.BAD_REQUEST
        );
      }

      return prepareSuccessResponse(
        res,
        "Correct password provided!",
        null,
        "read"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Load User
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async loadUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      /**
       * Subscription.toJSON is required
       * so that decimal is properly converted
       */
      const { role, id } = req.user;

      console.log("req.user", req.user);

      /**
       * if user is client (and may or may not be mssp) and is logged in different account context then take tenant_id,
       * if user is client and is logged in as mssp then take it own id (user.id)
       * --------------------------------------------------------------------------
       * So tenant_id is required here for mssp switched context only, as it
       * has to load that user to which it has switched its context.
       */
      const user = await this.userService.model
        .findById(role === UserRole.Client ? id : id)
        .select("-password -password_reset_token");

      console.log("user", user);
      if (!user) {
        return prepareFailedResponse(
          res,
          ["User does not exist!"],
          statusCodes.NOT_FOUND
        );
      }
      if (user.activate === false) {
        return prepareFailedResponse(
          res,
          ["Account not active!"],
          statusCodes.NOT_FOUND
        );
      }
      const userObj = user.toObject();

      const completeUser = {
        ...userObj,
      };
      const data: Record<string, unknown> = {
        ...completeUser,
        environment: globals.ENV,
        token: (req.cookies as Record<string, unknown>).accessToken,
      };
      return prepareSuccessResponse(
        res,
        "user loaded successfully!",
        data,
        "read"
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Logout User
   *
   * @param {Request} req Express request
   * @param {Response} res Express response
   * @param {NextFunction} next Express next
   * @returns {Promise<Response | void>} Returns HTTP response
   */
  @bind
  public async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // Simply clear the cookies
      res.clearCookie("accessToken", globals.cookieOptions);
      res.clearCookie("refreshToken", {
        ...globals.cookieOptions,
        httpOnly: false,
      });

      const customLoggerObj: IAuditLoggerObj = {
        action: "create",
        initiator: {
          _id: req.user.id,
          email: req?.user?.email,
        },
        targets: [
          {
            // eslint-disable-next-line no-underscore-dangle
            _id: req.user.id,
            email: req?.user?.email,
          },
        ],
      };
      logger.info("User logged out successfully", customLoggerObj);

      return prepareSuccessResponse(
        res,
        "user logged out successfully!",
        null,
        "delete"
      );
    } catch (err) {
      return next(err);
    }
  }
}
