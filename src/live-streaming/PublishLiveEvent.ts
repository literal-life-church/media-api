import { OpenAPIRoute } from "chanfana";

import { type AppContext } from "../types";
import { OngoingLiveEventDomainModelSchema } from "./domain/model/OngoingLiveEventDomainModel";
import { OPENAPI_TAGS } from "./config";
import { PublishLiveEventDomainModelSchema } from "./domain/model/PublishLiveEventDomainModel";
import { UnauthorizedError } from "../shared/domain/model/UnauthorizedError";

export class PublishLiveEvent extends OpenAPIRoute {
    schema = {
        tags: OPENAPI_TAGS,
        summary: "Publish the metadata for a Live Event on YouTube",
        request: {
            ...PublishLiveEventDomainModelSchema(),
        },
        responses: {
            ...OngoingLiveEventDomainModelSchema(),
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
