import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { globals } from "./globals";
import { Environment } from "@customTypes/index";
import { createLogger, format, transports, Logger } from "winston";
import {
  logger as expressLogger,
  errorLogger,
  FilterRequest,
} from "express-winston";
import { ErrorRequestHandler } from "express";
// import { AuthService } from "@services/auth";
// import { JwtPayload } from "jsonwebtoken";
import moment from "moment";
const logDir = "logs";

// Create the log directory if it does not exist
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

let httpRequest: {
  requestMethod: string;
  requestUrl: string;
  requestId: string;
  protocol: string;
  remoteIp: string;
  requestSize: number;
  userAgent: string | undefined;
  referrer: string | undefined;
};
let meta: {
  httpRequest: typeof httpRequest;
  requestId: string;
};

const errorLog = join(logDir, "error.json.log");
const requestLog = join(logDir, "request.json.log");
const combinedLog = join(logDir, "combined.json.log");
const combinedNonJsonLog = join(logDir, "combined.log");
const exceptionsLog = join(logDir, "exceptions.json.log");

const loggingOptions = {
  level: "info",
  format: format.combine(
    format.errors({ stack: true }),
    format.colorize(),
    format.timestamp({
      format: () => moment().format("MMMM D YYYY, h:mm:ss A"),
    }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
};

const transportOptions = [
  new transports.File({
    filename: combinedLog,
    /*
     * Uncolorize or otherwide file will have
     * noisy color codes
     */
    format: format.combine(format.uncolorize(), format.json()),
  }),
  new transports.File({
    filename: combinedNonJsonLog,
    format: format.combine(format.uncolorize()),
  }),
];

/*
For Express requests logs only
This defaults logs to console as colored and
to comibied file as unclored and not all the json
e,g (HTTP GET /)
*/
export const requestLoggerInstance = createLogger({
  ...loggingOptions,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: requestLog,
      format: format.combine(format.uncolorize(), format.json()),
    }),
    ...transportOptions,
  ],
});

/*
For no -requests logs
This can log each and every thing
by using debug, info, warn and error
*/
export const logger: Logger = createLogger({
  ...loggingOptions,
  transports: [
    new transports.File({
      filename: errorLog,
      level: "error",
      format: format.combine(format.uncolorize(), format.json()),
    }),
    ...transportOptions,
  ],
  exceptionHandlers: [
    new transports.File({
      filename: exceptionsLog,
      format: format.combine(format.uncolorize(), format.json()),
    }),
  ],
});

/**
 *
 * @param {Request} req - request object
 * @param {} propName
 * @returns
 */
function customRequestFilter(req: FilterRequest, propName: any) {
  if (propName !== "headers") {
    return req[propName];
  }
  const { cookie, ...rest } = req.headers;

  return rest;
}

// /*
// This will log each and every request
// according the fomrat we have defined 
// and in json.
// */
// export const requestLogger: Handler = expressLogger({
//   winstonInstance: requestLoggerInstance,
//   statusLevels: true,
//   requestFilter: customRequestFilter,
//   dynamicMeta: (req, res, err) => {
//     httpRequest = {} as typeof httpRequest;
//     meta = {} as typeof meta;
//     if (req) {
//       const authService = new AuthService();
//       const token = req.cookies.token;

//       if (token) {
//         const decoded = authService.verifyToken(token);
//         if (decoded) {
//           req.user = decoded.user as typeof req.user;
//         }
//       }

//       meta.httpRequest = httpRequest;
//       httpRequest.requestMethod = req.method;
//       httpRequest.requestUrl = `${req.protocol}://${req.get("host")}${
//         req.originalUrl
//       }`;
//       httpRequest.protocol = `HTTP/${req.httpVersion}`;
//       httpRequest.requestId = `${req?.user?.id}`;
//       httpRequest.remoteIp = req.ip
//         ? (req.ip || "").indexOf(":") >= 0
//           ? req.ip.substring(req.ip.lastIndexOf(":") + 1)
//           : req.ip
//         : "";
//       httpRequest.requestSize = req.socket.bytesRead;
//       httpRequest.referrer = req.get("Referrer");
//       meta.requestId = `${req?.user?.id}`;
//     }
//     return meta;
//   },
// });

/*
This will log each and every request
according the fomrat we have defined 
and in json.
*/
export const requestErrorLogger: ErrorRequestHandler = errorLogger({
  winstonInstance: requestLoggerInstance,
});

logger.add(
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    level: globals.ENV !== Environment.Production ? "debug" : "info",
  })
);
