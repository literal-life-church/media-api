import { AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD } from "../../config";
import { HttpError } from "./HttpError";

export class UnauthorizedError extends HttpError {
    static readonly statusCode = 401;
    static readonly publicMessage = "You are not authorized to perform this action";
    static readonly errorName = "UnauthorizedError";
    static readonly schemaDescription = `The request was rejected because the \`Bearer\` token was missing, incorrect, or the \`${AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD}\` in the request body was outside the acceptable time window`;
}

