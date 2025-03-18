// import mongoose, { Schema, model } from "mongoose";
// import {IUserDocument} from "./types";
// import {  UserRole } from '@customTypes/index';
// mongoose.set("useCreateIndex", true);

// const UserSchema: Schema = new Schema({
//   username: {
//     type: String,
//     required: true
//   },
//   // address: {
//   //   type: String,
//   //   required: true,
//   // },
//   // organization: {
//   //   type: String,
//   //   required: true,
//   // },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   // created_by: {
//   //   type: Schema.Types.ObjectId,
//   //   ref: 'users'
//   // },
//   role: {
//     type: String,
//     enum: UserRole,
//     default: UserRole.Client,
//     required: true
//   },
//   activate:{
//     type:Boolean,
//     default:false,
//     required:true
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   avatar: {
//     type: String,
//   },
//   avatar_file_name: {
//     type: String,
//   },
//   date: {
//     type: Date,
//     default: Date.now,
//     required: true
//   },
//   modified_date: {
//     type: Date,
//     default: Date.now,
//     required: true
//   },
//   last_password_change: {
//     type: Date,
//     default: Date.now,
//     required: true
//   },
//   password_reset_token: {
//     type: String,
//   },
//   failed_login_attempts: {
//     type: Number, default:0
//   }
// });

// export default  model<IUserDocument>("users", UserSchema);
