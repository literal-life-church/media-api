import { HttpError } from "../../../../shared/domain/model/error/HttpError";

export class NotAValidPrewarmLiveEventPayloadError extends HttpError {
    static readonly statusCode = 400;
    static readonly publicMessage = "Not a supported prewarm live event payload";
    static readonly errorName = "NotAValidPrewarmLiveEventPayloadError";
    static readonly schemaDescription = "The request body did not match the expected schema for prewarming a live event";
}
