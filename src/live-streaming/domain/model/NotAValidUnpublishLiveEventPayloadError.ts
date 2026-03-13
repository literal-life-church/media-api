import { HttpError } from "../../../shared/domain/model/HttpError";

export class NotAValidUnpublishLiveEventPayloadError extends HttpError {
    static readonly statusCode = 400;
    static readonly publicMessage = "Not a supported unpublish live event payload";
    static readonly errorName = "NotAValidUnpublishLiveEventPayloadError";
    static readonly schemaDescription = "The request body did not match the expected schema for unpublishing a live event";
}
