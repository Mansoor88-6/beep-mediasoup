// import { Document, Model, ObjectId } from 'mongoose';
// import { UserRole } from '@customTypes/index';

// /**
//  * USERS
//  * 
//  */
// export interface IUser {
//   readonly username: string;
//   // readonly address:string;
//   readonly created_by?: string | ObjectId | IUserDocument;
//   // readonly organization:string;
//   readonly email: string;
//   readonly role: UserRole;
//   readonly activate: boolean;
//   readonly password: string;
//   readonly password_reset_token?: string;
//   readonly avatar?: string;
//   readonly avatar_file_name?: string;
//   readonly date: Date;
//   readonly modified_date: Date;
//   readonly last_password_change: Date;
//   readonly failed_login_attempts: number;
// }

// export interface IUserDocument extends IUser, Document {}
// export interface IUserModel extends Model<IUserDocument> {}