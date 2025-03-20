import express from 'express';
import { Server } from "http";
import ExpressLoader from './express';
// import SwaggerLoader from './swagger';
// import mongooseLoader from './mongoose';
import { logger } from '@config/logger';
import SocketServer from '@socket/socketServer'


export default async (app:express.Application, httpServer: Server): Promise<ExpressLoader> => {

    const socketServer = SocketServer.getInstance(httpServer);

    // await mongooseLoader();
    // logger.info('🚀 MongoDB Initialized!');
    const expressInstance = new ExpressLoader(app, httpServer);
    logger.info('🚀 Express Initialized!');
    // new SwaggerLoader(app);
    // logger.info('🚀 Swagger Initialized!');
    // const redis = Redis.getInstance();
    // await redis.connect();
    // logger.info('🚀 Redis Initialized!');
    await socketServer.connect();
    logger.info('🚀 Socket Initialized!');
    return expressInstance;
}

