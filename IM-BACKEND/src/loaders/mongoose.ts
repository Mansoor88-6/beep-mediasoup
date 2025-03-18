// // import mongoose from 'mongoose';
// import { globals } from '../config/globals';
// import { logger } from '@config/logger'
// export default async(): Promise<mongoose.Connection> => {

//     /**
//    * "Type 'string | undefined' is not assignable to type 'string'"
//    * When this error is given use non-null assertion operator "!"
//    * at the end of variable. It tells TypeScript that even though
//    * something looks like it could be null, it can trust you that it's not
//    * Always enable 'runValidators' as true so that update also runs validation
//    */
//     const URL: string = globals.MONGO_URI || '';
//     const database = await mongoose.connect(URL, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useCreateIndex: true,
//         useFindAndModify: false,
//     })
//     database.set('runValidators', true);
//     database.connection.on('error', (error) => {
//         logger.error('Database connection error:', error);
//     });
//     logger.info('🚀 Database Connected')
//     return database.connection

// };
