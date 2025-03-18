// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable camelcase */
// import { IUserModel, IUserDocument } from "@models/index";
// import { AuthService } from "@services/auth";
// import { UtilityService } from "@services/helper/utility";
// import Dao from "@models/dataAccessObject";
// import { UserRole } from "../../../types/index";

// export default class UserService extends Dao<IUserModel> {
//   /**
//    * Constructor
//    * @param {IUserModel} model User Db Model
//    */
//   constructor(model: IUserModel) {
//     super(model);
//   }

//   /**
//    * Get All Users
//    * @returns {Promise<IUserDocument[]>} Get Users Array
//    */
//   public async getAllUsers(): Promise<IUserDocument[]> {
//     try {
//       return this.model.find({});
//     } catch (err) {
//       throw new Error(err);
//     }
//   }

//   /**
//    * Encode password reset token
//    * @param {string} id id of user
//    * @returns {string} Get encoded token
//    */
//   public encodePasswordResetToken(id: string): string {
//     try {
//       const authService = new AuthService();
//       const hex = UtilityService.generateRandomHex();

//       return authService.createAccessToken({
//         value: hex,
//         id: id,
//         type: "password_reset",
//       });
//     } catch (err) {
//       throw new Error(err);
//     }
//   }

//   /**
//    * Decode password reset token
//    * @param {string} token Token to be decoded
//    * @returns {{value: string, id: string}} Get decoded token
//    */
//   public decodePasswordResetToken(token: string): {
//     value: string;
//     id: string;
//   } {
//     try {
//       const authService = new AuthService();
//       const decoded = authService.verifyToken(token);

//       if (
//         !decoded ||
//         !decoded.value ||
//         !decoded.id ||
//         decoded.type !== "password_reset"
//       ) {
//         throw new Error("Invalid password reset token");
//       }

//       return {
//         value: decoded.value as string,
//         id: decoded.id as string,
//       };
//     } catch (err) {
//       throw new Error(err);
//     }
//   }

//   /**
//    * Generate random user password
//    * @returns {string} random password of length = 8
//    */
//   public generateUserPassword(): string {
//     try {
//       return UtilityService.generateRandomString();
//     } catch (err) {
//       throw new Error(err);
//     }
//   }

//   /**
//    * Extract user payload
//    * @param {IUserDocument} doc User Db Model
//    * @returns {Record<string, unknown>} Get Users Array
//    */
//   public extractPayload(doc: IUserDocument): Record<string, unknown> {
//     try {
//       /**
//        * Except from mssp all "Client's"and "Admin's" tenant id will be
//        * same as their own id.
//        * All "Subclient's" tenant id will be their parent account
//        * id (whose role is "Client" taken from user.created_by field)
//        */
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     //   let tenantId = doc.id;
//     //   if (doc.role === UserRole.Client) {
//     //     tenantId = null;
//     //   }
//       return {
//         user: {
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//           id: doc.id,
//           role: doc.role,
//           email: doc.email,
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, camelcase, no-nested-ternary
//         //   tenant_id: tenantId,
//         },
//       };
//     } catch (err) {
//       throw new Error(err);
//     }
//   }

//   public extractMsspPayload(
//     msspUser: IUserDocument,
//     switchUser: IUserDocument,
//     msalLogin = false
//   ): Record<string, unknown> {
//     try {
//       /**
//        * For mssp switch users
//        */
//       return {
//         user: {
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//           id: msspUser.id,
//           role: msspUser.role,
//           msalLogin: msalLogin,
//           mssp: true,
//           switchedEmail: switchUser.email,
//           email: msspUser.email,
//           // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, camelcase
//           tenant_id: switchUser.id !== msspUser.id ? switchUser.id : null,
//         },
//       };
//     } catch (err) {
//       throw new Error(err);
//     }
//   }
// }
