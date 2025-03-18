// /* eslint-disable camelcase */
// import { sign, verify, JwtPayload } from "jsonwebtoken";
// import { globals } from "@config/globals";
// import { randomBytes } from "crypto";

// /**
//  * Simplified AuthService for JWT token handling
//  */
// export class AuthService {
//   private readonly jwtSecret: string = globals.JWT_SECRET as string;

//   /**
//    * Create payload for token
//    * @param user User object to create payload from
//    * @returns Payload object
//    */
//   public createPayload(user: any): Record<string, unknown> {
//     return {
//       id: user.id ? user.id : user._id,
//       email: user.email,
//       username: user.username,
//       role: user.role,
//     };
//   }

//   /**
//    * Create access token
//    * @param user User object to create token for
//    * @returns JWT access token
//    */
//   public createAccessToken(user: any): string {
//     const payload = this.createPayload(user);
//     return sign(payload, this.jwtSecret, {
//       expiresIn: "1d",
//     });
//   }

//   /**
//    * Create refresh token
//    * @returns Random string as refresh token
//    */
//   public createRefreshToken(): string {
//     return randomBytes(5).toString("hex"); // 10 characters
//   }

//   /**
//    * Verify JWT token
//    * @param token JWT token to verify
//    * @returns Decoded token data or null if invalid
//    */
//   public verifyToken(token: string): JwtPayload | null {
//     try {
//       return verify(token, this.jwtSecret) as JwtPayload;
//     } catch (error) {
//       return null;
//     }
//   }

//   /**
//    * Check if user has required role permissions
//    * @param allowedRoles Permitted roles to access the resource
//    * @param userRole role of user
//    * @returns boolean indicating if user has permission
//    */
//   public hasPermission(allowedRoles: string[], userRole: string): boolean {
//     return allowedRoles.includes(userRole);
//   }
// }
