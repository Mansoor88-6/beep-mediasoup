import { Response } from 'express';
import { statusCodes } from '@config/globals';


type Action = 'create' | 'update' | 'read' | 'delete' | 'verify' | undefined;

/**
 * Prepare Responses
 * @param {Response} res res object that will process the response
 * @param {string} msg Message to be sent
 * @param {unknown} data data to be send in response can be of any type. (optional)
 * @param {Action} action status code (default 200) can be "create", "update", "read" or "delete"
 * @param {number} status status code (default 200)
 * @returns {void}
 */
function prepareSuccessResponse(res: Response, msg:string, data?: unknown, action?:Action, status?:number): void {
    let responseData:Record<string, unknown> = { msg:msg };
    responseData = { msg:msg };
    if (data) {
        responseData.data = data;
    }
    if (action) {
        responseData.action = action;
    }
    if (status) {
        res.status(status).json(responseData);
    } else {
        res.json(responseData);
    }
}

/**
 * Prepare Responses
 * @param {Response} res res object that will process the response
 * @param {Array<string>} errors data to be send in response
 * @param {number} status status code (default 200)
 * @returns {void}
 */
function prepareFailedResponse(res: Response, errors:Array<string>, status?:number): void {
    res.status(status || statusCodes.SERVER_ERROR).json({
        errors: errors.map((err) => {
            return { msg: err };
        })
    });
}

export { prepareSuccessResponse, prepareFailedResponse }
