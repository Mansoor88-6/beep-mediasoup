// /* eslint-disable @typescript-eslint/no-misused-promises */
// /* eslint-disable @typescript-eslint/unbound-method */

// import { Router as expressRrouter } from "express";
// import {
//   isAuthenticated,
//   isAuthorized,
//   validateReqBody,
//   userProfileImageUpload,
// } from "../../../middleware/locals";
// import { check } from "express-validator";
// import { UserRole } from "@customTypes/index";
// import UserController from "./controller";
// import { regex } from "@config/globals";

// export default class UserRoutes {
//   private readonly controller: UserController = new UserController();
//   public router: expressRrouter = expressRrouter();

//   /**
//    * Contructor
//    */
//   public constructor() {
//     this.initRoutes();
//   }

//   /**
//    * Init User routes
//    * @returns {void}
//    */
//   private initRoutes(): void {
//     this.router.post(
//       "/register-organization",
//       isAuthenticated(),
//       isAuthorized([UserRole.Admin, UserRole.Client], true),
//       [
//         check("username", "Username field is required")
//           .not()
//           .isEmpty()
//           .matches(regex.CHECK_ONLY_ALPHABETS)
//           .withMessage("Username must be alphabets only"),
//         //   check('lastName', 'Last Name field is required')
//         //       .not()
//         //       .isEmpty()
//         //       .matches(regex.CHECK_ONLY_ALPHABETS)
//         //       .withMessage('Last Name must be alphabets only'),
//         check("email", "Email is required").isEmail(),
//         //   check('address', 'Address is required').not().isEmpty(),
//         //   check('organization', 'Organization is required').not().isEmpty(),
//       ],
//       validateReqBody(),
//       this.controller.register
//     );

//     this.router.post(
//       "/register",
//       [
//         check("username", "username is required")
//           .not()
//           .isEmpty()
//           .matches(regex.CHECK_ONLY_ALPHABETS)
//           .withMessage("username must be alphabets only"),
//         //   check('lastName', 'Last Name is required')
//         //       .not()
//         //       .isEmpty()
//         //       .matches(regex.CHECK_ONLY_ALPHABETS)
//         //       .withMessage('Last Name must be alphabets only'),
//         check("email", "Email is required").isEmail(),
//         //   check('address', 'Address is required').not().isEmpty(),
//         //   check('organization', 'Organization is required').not().isEmpty(),
//         check("password", "Password is required")
//           .not()
//           .isEmpty()
//           .matches(
//             /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/,
//             "i"
//           )
//           .withMessage(
//             `Password must be of atleast 8 characters and should include one
//                lowercase character, one uppercase character, a number, and a special character.`
//           ),
//         check("confirmPassword", "Confirm Password is required")
//           .not()
//           .isEmpty()
//           .matches(
//             /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,}$/,
//             "i"
//           )
//           .withMessage(
//             `Confirm password must be of atleast 8 characters and should include one
//                lowercase character, one uppercase character, a number, and a special character.`
//           ),
//       ],
//       validateReqBody(),
//       this.controller.signUp
//     );

//     /**
//      * Don't use this route
//      * for sub client, As email
//      * and organization cannot
//      * be edited.
//      */
//     this.router.post(
//       "/:clientId",
//       isAuthenticated(),
//       isAuthorized([UserRole.Admin, UserRole.Client]),
//       [
//         check("username", "Username field is required")
//           .not()
//           .isEmpty()
//           .matches(regex.CHECK_ONLY_ALPHABETS)
//           .withMessage("Username must be alphabets only"),
//         check("email", "Email is required").isEmail(),
//         check("activate", "Activate is required")
//           .isBoolean({ strict: true })
//           .not()
//           .isEmpty(),
//       ],
//       validateReqBody(),
//       this.controller.updateUser
//     );

//     this.router.put(
//       "/profile",
//       isAuthenticated(),
//       isAuthorized([UserRole.Client, UserRole.Admin]),
//       [
//         check("username", "First Name field is required")
//           .not()
//           .isEmpty()
//           .matches(regex.CHECK_ONLY_ALPHABETS)
//           .withMessage("First Name must be alphabets only"),
//         check("lastName", "Last Name field is required")
//           .not()
//           .isEmpty()
//           .matches(regex.CHECK_ONLY_ALPHABETS)
//           .withMessage("Last Name must be alphabets only"),
//         check("address", "Address is required").not().isEmpty(),
//         check(
//           "firstName",
//           "First Name cannot be longer than 100 characters "
//         ).isLength({ max: 100 }),
//         check(
//           "lastName",
//           "Last Name cannot be longer than 100 characters "
//         ).isLength({ max: 100 }),
//         check(
//           "address",
//           "Address cannot be longer than 100 characters"
//         ).isLength({ max: 100 }),
//       ],
//       validateReqBody(),
//       this.controller.updateUserProfile
//     );

//     this.router.put(
//       "/avatar",
//       isAuthenticated(),
//       isAuthorized([UserRole.Client, UserRole.Admin]),
//       userProfileImageUpload(),
//       this.controller.updateUserAvatar
//     );

//     this.router.get(
//       "/random-password",
//       isAuthenticated(),
//       isAuthorized([UserRole.Admin]),
//       this.controller.generateRandomPassword
//     );

//     this.router.get(
//       "/",
//       isAuthenticated(),
//       isAuthorized([UserRole.Admin]),
//       this.controller.getAllUsers
//     );

//     this.router.delete(
//       "/",
//       isAuthenticated(),
//       isAuthorized([UserRole.Admin, UserRole.Client]),
//       this.controller.deleteUser
//     );

//     this.router.get(
//       "/chat-participants",
//       isAuthenticated(),
//       this.controller.getChatParticipants
//     );
//   }
// }
