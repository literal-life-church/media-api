import { contentJson, OpenAPIRoute } from "chanfana";
import { type AppContext } from "../types";
import { OPENAPI_TAGS } from "./config";
import { OngoingLiveEventDomainModel } from "./domain/model/OngoingLiveEventDomainModel";
import { PublishLiveEventDataModel } from "./data/model/PublishLiveEventDataModel";
import { StringToHmacSignatureMapper } from "../shared/data/mapper/StringToHmacSignatureMapper";
import { UnauthorizedError } from "../shared/domain/model/UnauthorizedError";

export class PublishLiveEvent extends OpenAPIRoute {
    schema = {
        tags: OPENAPI_TAGS,
        summary: "Publish the metadata for a Live Event on YouTube",
        request: {
            body: contentJson(PublishLiveEventDataModel),
        },
        responses: {
            "201": {
                description: "Returns the captured and transformed metadata for the published Live Event",
                ...contentJson(OngoingLiveEventDomainModel),
            },
            ...UnauthorizedError.schema(),
        },
    };

    async handle(c: AppContext) {
        // Get validated data
        const data = await this.getValidatedData<typeof this.schema>();

        // Retrieve the validated request body
        const liveEventPayload = data.body;
        const cleanBody = JSON.stringify(liveEventPayload);

        return {
            status: "live",
            event: {
                embedUrl: `https://www.youtube.com/embed/${liveEventPayload.videoId}`,
                watchUrl: `https://www.youtube.com/live/${liveEventPayload.videoId}`,
                videoId: liveEventPayload.videoId,
                name: liveEventPayload.name,
                description: liveEventPayload.description,
            },
            cancellation: null,
        };
    }
}
