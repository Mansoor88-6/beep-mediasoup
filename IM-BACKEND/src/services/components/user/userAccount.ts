/* eslint-disable max-params */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { IUserModel, IUserDocument } from '@models/index';
import { UtilityService } from '@services/helper/utility';
import UserService from '@services/components/user/user'

import path from 'path'
import { AxiosError } from 'axios';
import { FileFilterCallback } from 'multer';
import { UserRole } from '@customTypes/index';
import { ServiceError } from '@customErrors/index';
import { globals, statusCodes } from '@config/globals';
import { ClientSession, ObjectId, startSession } from 'mongoose';
import { Express } from 'express';
import moment from 'moment';

export default class UserAccountService extends UserService {

    /**
   * Constructor
   * @param {IUserModel} model User Db Model
   */
    constructor(model: IUserModel) {
        super(model);
    }

    /**
    * Get register User
    * @param {string} username first name
    * @param {string} email email address
    // * @param {string} address physical address
    // * @param {string} organization organization name
    // * @param {string | ObjectId} createdBy user who created
    * @param {string} password user password
    * @param {boolean} activate activate account
    // * @param {string} role for account
    * @returns {Promise<IUserDocument | null>} returns user document
   */
    public async registerAccount(
        username:string,
        email: string,
        // address:string,
        // organization:string,
        // createdBy: string | ObjectId | null,
        password:string,
        activate: boolean,
    ):
    Promise<IUserDocument | null> {
        let session: ClientSession | null = null;
        const emailLowerCase = UtilityService.convertToLowercase(email);
        let error: Record<string, unknown> | AxiosError = {};
        // const zero = 0;
        try {
            if (await this.model.findOne({ email: emailLowerCase })) {
                throw new ServiceError('Email already exists', statusCodes.CONFLICT);
            }
            

            /**
        * If transaction has some issues (e.g validation issues)
        * It will not be saved as it will give eror and session
        * will not be ended properly.
        */
            session = await startSession();
            session.startTransaction();


            // eslint-disable-next-line new-cap
            const user = new this.model({
                username:username,
                // address: address,
                // organization: organization,
                email:emailLowerCase,
                // created_by: createdBy,
                role: UserRole.Client,
                activate: activate,
                password: await UtilityService.generatHash(password, await UtilityService.generateSalt(globals.SALT_LENGTH))
            });

            /**
           * Also using Promise.all with sessions
           * for saving documents give error
           */
            await user.save({ session: session })

            /**
            * Complete db transaction.
            */
            await session.commitTransaction();
            session.endSession();
            return await this.model.findById(user.id)
                .select('-password -password_reset_token');
        } catch (err) {
            if (session && session.inTransaction()) {
                await session.abortTransaction();
            }
            error = err as (Record<string, unknown> | AxiosError);

            const axiosError = error as unknown as AxiosError;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            throw new ServiceError(
                axiosError && axiosError.response && axiosError.response.data &&
                (axiosError.response.data as Record<string, unknown>).message ?
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    axiosError.response.data.message : error.message, statusCodes.SERVER_ERROR);

        }
    }

    /**
  * Blob name resolver
  *
  * @param {any} req Express request
  * @param {Express.Multer.File} file Name of the file to be uploaded
  * @returns {Promise<string>} resolved file name
  */
   public resolveBlobName = (req: unknown, file: Express.Multer.File): Promise<string> => {
       return new Promise<string>((resolve) => { // ,reject
           const blobName = `${Math.random().toString().replace(/0\./, '')}-Profile-${file.originalname}`;
           resolve(blobName);
       });
   };

   public imageFilter = (req: unknown, file: Express.Multer.File, cb:FileFilterCallback):
   // eslint-disable-next-line consistent-return
   void => {
       const filTypes = /jpeg|jpg|png/;
       // Check ext
       const extname = filTypes.test(path.extname(file.originalname).toLowerCase());
       // Check mime
       const mimetype = filTypes.test(file.mimetype);
       //    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {

       if (mimetype && extname) {
           cb(null, true);
       } else {
           cb(null, false);
           return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
       }
   }
}


