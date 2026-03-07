import { OpenAPIRoute } from "chanfana";

import { type AppContext } from "../types";
import { OPENAPI_TAGS } from "./config";
import { OngoingLiveEventSchema } from "./domain/model/OngoingLiveEventDomainModel";
import { PublishLiveEventRequestSchema } from "./data/model/PublishLiveEventDataModel";
import { UnauthorizedError } from "../shared/domain/model/UnauthorizedError";

export class PublishLiveEvent extends OpenAPIRoute {
    schema = {
        tags: OPENAPI_TAGS,
        summary: "Publish the metadata for a Live Event on YouTube",
        request: {
            ...PublishLiveEventRequestSchema(),
        },
        responses: {
            ...OngoingLiveEventSchema(),
            ...UnauthorizedError.schema(),
        },
    };

    async handle(c: AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const liveEventPayload = data.body;

        return c.json({
            status: "live",
            event: {
                embedUrl: `https://www.youtube.com/embed/${liveEventPayload.videoId}`,
                watchUrl: `https://www.youtube.com/live/${liveEventPayload.videoId}`,
                videoId: liveEventPayload.videoId,
                name: liveEventPayload.name,
                description: liveEventPayload.description,
            },
            cancellation: null,
        }, 201);
    }
}
