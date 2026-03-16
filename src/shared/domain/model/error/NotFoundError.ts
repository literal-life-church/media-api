import { HttpError } from "./HttpError";

export class NotFoundError extends HttpError {
    static readonly statusCode = 404;
    static readonly publicMessage = "The requested resource was not found";
    static readonly errorName = "NotFoundError";
    static readonly schemaDescription = "The requested endpoint does not exist";
}
