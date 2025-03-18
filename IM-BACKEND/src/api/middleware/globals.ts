import {
  NextFunction,
  Request,
  Response,
  Router,
  RequestHandler,
} from "express";
import { UtilityService } from "@services/helper/utility";
import { statusCodes, globals } from "@config/globals";
// import { ServiceError } from "@customErrors/index";
import {
  prepareFailedResponse,
  prepareSuccessResponse,
} from "../baseController";
import { Environment } from "@customTypes/index";

const mongooseErrors = [
  "CastError",
  "DisconnectedError",
  "DivergentArrayError",
  "MissingSchemaError",
  "DocumentNotFoundError",
  "ObjectExpectedError",
  "ObjectParameterError",
  "OverwriteModelError",
  "ParallelSaveError",
  "StrictModeError",
  "VersionError",
];

/**
 * Init Express error handler
 *
 * @param {Router} router Express Router
 * @returns {void}
 */
export function registerErrorHandler(router: Router): void {
  router.use(
    (err: any, req: Request, res: Response, next: NextFunction) => {
      UtilityService.handleError(err);
      if (globals.ENV !== Environment.Production) {
        if (err.name === "MongoError" && (err as any).code == 11000) {
          return prepareFailedResponse(
            res,
            ["Record Already Exist"],
            err.statusCode || statusCodes.SERVER_ERROR
          );
        }
        return prepareFailedResponse(
          res,
          [err.message as string],
          err.statusCode || statusCodes.SERVER_ERROR
        );
      } else {
        if (err.name === "MongoError" && (err as any).code == 11000) {
          return prepareFailedResponse(
            res,
            ["Record Already Exist"],
            err.statusCode || statusCodes.SERVER_ERROR
          );
        } else if (mongooseErrors.includes(err.name)) {
          return prepareFailedResponse(
            res,
            ["Internal Server Error. Please try again later."],
            err.statusCode || statusCodes.SERVER_ERROR
          );
        } else {
          return prepareFailedResponse(
            res,
            [err.message as string],
            err.statusCode || statusCodes.SERVER_ERROR
          );
        }
      }
    }
  );
}
