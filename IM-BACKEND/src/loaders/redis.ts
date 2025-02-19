/* eslint-disable no-underscore-dangle */
import { globals } from "@config/globals";
import { createClient, RedisClientType } from "redis";
import { logger } from "@config/logger";

export default class Redis {
  private static _instance: Redis;
  private static _socketInstance: Redis;
  private client: RedisClientType;

  /**
   * Constructor
   */
  private constructor() {
    this.client = createClient({
      url: globals.ENV === "development" ? "" : "redis://redis:6379",
      socket: {
        host: globals.ENV === "development" ? "localhost" : "",
        // host: globals.REDIS_SOCKET_HOST,
        port: globals.REDIS_SOCKET_PORT,
      },
      password: globals.REDIS_PASSWORD,
    });
    this.client.on("error", (err) => {
      logger.error(err);
    });
  }

  /**
   * create detail report
   * @returns {Promise<void>}
   */
  public async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * create detail report
   * @returns {Redis}
   */
  public static getInstance(): Redis {
    if (!Redis._instance) {
      Redis._instance = new Redis();
    }
    return Redis._instance;
  }

  /**
   * create detail report
   * @returns {Redis}
   */
  public static getSocketInstance(): Redis {
    if (!Redis._socketInstance) {
      Redis._socketInstance = new Redis();
    }
    return Redis._socketInstance;
  }

  /**
   * create detail report
   * @returns {RedisClientType}
   */
  public getClient(): RedisClientType {
    return this.client;
  }

  /**
   * create detail report
   * @returns {RedisClientType}
   */
  public static getNewConnection(): RedisClientType {
    const newClient: RedisClientType = createClient({
      socket: {
        host: globals.REDIS_SOCKET_HOST,
        port: globals.REDIS_SOCKET_PORT,
      },
      password: globals.REDIS_PASSWORD,
    });
    return newClient;
  }

  /**
   * Close connection gracefully
   *
   * @param {RedisClientType} client - redis client
   * @returns {void}
   */
  public static async startConnection(client: RedisClientType): Promise<void> {
    try {
      await client.connect();
    } catch (err) {
      logger.error(err);
    }
  }

  /**
   * Close connection gracefully
   *
   * @param {RedisClientType} client - redis client
   * @returns {void}
   */
  public static async closeConnection(client: RedisClientType): Promise<void> {
    try {
      if (client.isOpen || client.isReady) {
        await client.disconnect();
      }
    } catch (err) {
      logger.error(err);
    }
  }
}
