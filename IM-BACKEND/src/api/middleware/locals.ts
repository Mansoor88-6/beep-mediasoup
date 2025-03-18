// import { NextFunction, Request, Response, Handler } from "express";
// import { validationResult } from "express-validator";
// import { JwtPayload } from "jsonwebtoken";
// import { AuthService } from "@services/auth";
// import { UtilityService } from "@services/helper/utility";
// import {
//   prepareFailedResponse,
//   prepareSuccessResponse,
// } from "../baseController";
// import { globals, statusCodes } from "@config/globals";
// import { Multer, MulterError } from "multer";
// import UserAccountService from "@services/components/user/userAccount";
// import User from "@models/components/user/user";

// import { logger } from "../../config/logger";
// import UserService from "@services/components/user/user";
// import UserModel from "@models/components/user/user";
// import { IUserDocument } from "@models/index";
// import { Environment } from "@customTypes/index";
// const authService = new AuthService();

// /**
//  * Middleware for verifying user permissions from acl
//  *
//  * @param {Array<string>} allowedRoles Permitted roles to access the resource
//  * @returns {Handler}
//  */
// export function isAuthorized(
//   allowedRoles: Array<string>,
//   checkMssp = false
// ): Handler {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       let authorized: boolean = authService.hasPermission(
//         allowedRoles,
//         req.user.role
//       );
//       if (!authorized) {
//         /**
//          * Always usese forbidden status code for unauthorized.
//          * Check commenst in start of this file.
//          */
//         return prepareFailedResponse(
//           res,
//           ["Unauthorized access!"],
//           statusCodes.FORBIDDEN
//         );
//       }
//       return next();
//     } catch (err) {
//       return next(err);
//     }
//   };
// }

// /**
//  * Middleware for verifying if user is authenticated.
//  * @returns {Handler} Returns if resource is allowed or not
//  */
// export function isAuthenticated(): Handler {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       // Get token from Authorization header or cookies
//       const token =
//         req.header("Authorization")?.split(" ")[1] || req.cookies.accessToken;

//       if (!token) {
//         return prepareFailedResponse(
//           res,
//           ["Please authenticate using a valid token"],
//           statusCodes.UNAUTHORIZED
//         );
//       }

//       const data = authService.verifyToken(token);
//       if (!data) {
//         return prepareFailedResponse(
//           res,
//           ["Invalid token"],
//           statusCodes.UNAUTHORIZED
//         );
//       }

//       // Set user data directly from token payload
//       req.user = {
//         id: data.id as string,
//         email: data.email as string,
//         role: data.role as string,
//       };

//       return next();
//     } catch (err) {
//       return next(err);
//     }
//   };
// }

// /**
//  * Middleware for enforcing environment
//  * @returns {Handler}
//  */
// export function allowedEnvironments({
//   environments = [
//     Environment.Production as string,
//     Environment.Development as string,
//     Environment.Testing as string,
//   ],
// }): Handler {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       if (!~environments.indexOf(globals.ENV as string)) {
//         return res.status(404).json({ msg: "Url Not Found" });
//       }
//       return next();
//     } catch (err) {
//       return next(err);
//     }
//   };
// }

// /**
//  * Middleware for validating post requests
//  * @returns {Handler}
//  */
// export function validateReqBody(): Handler {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return prepareFailedResponse(
//           res,
//           errors.array().map((arr) => arr.msg),
//           statusCodes.UNPROCESSABLE_ENTITY
//         );
//       }
//       return next();
//     } catch (err) {
//       return next(err);
//     }
//   };
// }

// /**
//  * Middleware for routes which have files to be uploaded
//  * @returns {Handler}
//  */
// export function bodyParserForFileUploadRoute(): Handler {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       Object.keys(req.body).forEach((key) => {
//         req.body[key] =
//           UtilityService.tryParseJson(req.body[key]) || req.body[key];
//       });
//       return next();
//     } catch (err) {
//       return next(err);
//     }
//   };
// }

// /**
//  * Middleware for image upload
//  * @returns {Handler}
//  */
// export function userProfileImageUpload(): Handler {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userAccountService: UserAccountService = new UserAccountService(
//         User
//       );
//       // return upload image
//     } catch (err) {
//       return next(err);
//     }
//   };
// }

// /**
//  * Check common elements between arrays
//  *
//  * @param {Array<any>} arrA - Array A for comparison
//  * @param {Array<any>} arrB - Array B for comparison
//  * @returns {Array<any>} returns array with common elements
//  */
// function intersectArrays<T extends Array<any>>(arrA: T, arrB: T) {
//   /** Complexity: O(n log(n) + m log(m)) */
//   // Credits: Stackoverflow

//   var sorted_a = arrA.concat().sort();
//   var sorted_b = arrB.concat().sort();
//   var common = [];
//   var a_i = 0;
//   var b_i = 0;

//   while (a_i < arrA.length && b_i < arrB.length) {
//     if (sorted_a[a_i] === sorted_b[b_i]) {
//       common.push(sorted_a[a_i]);
//       a_i++;
//       b_i++;
//     } else if (sorted_a[a_i] < sorted_b[b_i]) {
//       a_i++;
//     } else {
//       b_i++;
//     }
//   }
//   return common;
// }

// const getTokenFromHeader: (req: Request) => string | undefined = (req) => {
//   const authHeader = req.headers.authorization;

//   if (authHeader === undefined) {
//     return undefined;
//   }

//   if (!authHeader.toLowerCase().startsWith("bearer ")) {
//     return undefined;
//   }

//   const parts = authHeader.split(" ");

//   if (parts.length < 1) {
//     return undefined;
//   }

//   return parts[1];
// };
