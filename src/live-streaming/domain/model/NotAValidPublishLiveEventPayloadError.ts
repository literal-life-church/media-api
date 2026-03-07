import { HttpError } from "../../../shared/domain/model/HttpError";

export class NotAValidPublishLiveEventPayloadError extends HttpError {
    static readonly statusCode = 400;
    static readonly publicMessage = "Not a supported publish live event payload";
    static readonly errorName = "NotAValidPublishLiveEventPayloadError";
    static readonly schemaDescription = "The request body did not match the expected schema for publishing a live event";
}
