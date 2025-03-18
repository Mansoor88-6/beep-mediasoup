import EnvVar from "dotenv";
import { Environment } from "@customTypes/index";

if (process.env.DEPLOYMENT_ENV == "non-local") {
  EnvVar.config({ path: ".env.production" });
} else {
  EnvVar.config({ path: `.env.${process.env.NODE_ENV}` });
}

let branding: {
  BRAND_NAME: string;
  BRAND_FULL_NAME: string;
  BRAND_CONTACT_EMAIL: string;
};

let globals: {
  /**
   * Server configurations
   */
  ENV: string | undefined;
  SERVER_PORT: number;
  CORS: Array<string>;
  cookieOptions: object;
  DEFAULT_TIMEZONE: string | undefined;
  /**
   * Db configurations
   */
  MONGO_URI: string | undefined;

  /**
   * Auth configurations
   */
  SERVER_SECRET: string | undefined;

  /**
   * JWT configutrations
   */
  JWT_SECRET: string;
  JWT_USER_EXPIRY: number;
  JWT_RESET_PASS_EXPIRY: number;
  /**
   * Redis configutrations
   */
  REDIS_SOCKET_HOST: string;
  REDIS_SOCKET_PORT: number;
  REDIS_PASSWORD: string;

  /**
   * login attempt failed
   */
  FAILED_LOGIN_ATTEMPTS_ALLOWED: number;

  /**
   * Others
   */
  NOT_FOUND: number;
  SALT_LENGTH: number;
  DEFAULT_RANDOM_BYTES: number;
};

let serverUrls: {
  FRONTEND: string;
};

let statusCodes: {
  OK: number;
  BAD_REQUEST: number;
  CONFLICT: number;
  UNAUTHORIZED: number;
  FORBIDDEN: number;
  NOT_FOUND: number;
  SERVER_ERROR: number;
  UNPROCESSABLE_ENTITY: number;
};

let regex: {
  CHECK_ONLY_ALPHABETS: RegExp;
};

globals = {
  /**
   * Server configurations
   */
  ENV: process.env.NODE_ENV,
  SERVER_PORT: Number(process.env.SERVER_PORT),
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE,
  CORS: (process.env.CORS as string).split(","),
  cookieOptions: {
    httpOnly: false,
    secure:
      process.env.NODE_ENV === Environment.Production ||
      process.env.NODE_ENV === Environment.Testing,
  },
  /**
   * Db configurations
   */
  MONGO_URI: process.env.MONGO_URI,

  /**
   * Auth configurations
   */
  SERVER_SECRET: process.env.SERVER_SECRET,

  /**
   * JWT configutrations
   */
  JWT_SECRET: process.env.JWT_SERVER_SECRET as string,
  JWT_USER_EXPIRY: Number(process.env.JWT_USER_EXPIRY),
  JWT_RESET_PASS_EXPIRY: Number(process.env.JWT_RESET_PASS_EXPIRY),
  /**
   * Redis configutrations
   */
  REDIS_SOCKET_HOST: process.env.REDIS_SOCKET_HOST as string,
  REDIS_SOCKET_PORT: Number(process.env.REDIS_SOCKET_PORT),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,

  /*
   * login attempt failed
   */
  FAILED_LOGIN_ATTEMPTS_ALLOWED: 5,

  /**
   * Others
   */
  NOT_FOUND: -1,
  SALT_LENGTH: 10,
  DEFAULT_RANDOM_BYTES: 32,
};

serverUrls = {
  FRONTEND: process.env.FRONTEND_URL as string,
};

statusCodes = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  UNPROCESSABLE_ENTITY: 422,
};

branding: branding = {
  BRAND_NAME: process.env.BRAND_NAME as string,
  BRAND_FULL_NAME: process.env.BRAND_FULL_NAME as string,
  BRAND_CONTACT_EMAIL: process.env.BRAND_CONTACT_EMAIL as string,
};

regex = {
  CHECK_ONLY_ALPHABETS: /^[A-Za-z\s]+$/,
};
export { globals, branding, statusCodes, serverUrls, regex };
