import { HttpError } from "../../../shared/domain/model/HttpError";

export class NotAValidCancelEventPayloadError extends HttpError {
    static readonly statusCode = 400;
    static readonly publicMessage = "Not a supported cancel event payload";
    static readonly errorName = "NotAValidCancelEventPayloadError";
    static readonly schemaDescription = "The request body did not match the expected schema for canceling a live event";
}
