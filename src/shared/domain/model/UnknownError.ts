import { HttpError } from "./HttpError";

export class UnknownError extends HttpError {
    static readonly statusCode = 500;
    static readonly publicMessage = "An unknown error occurred";
    static readonly errorName = "UnknownError";
    static readonly schemaDescription = "An unexpected error occurred while processing the request. No more specific information is available about the nature of the error.";
}
