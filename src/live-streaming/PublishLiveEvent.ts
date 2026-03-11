import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

import { type AppContext } from "../types";
import { NotAValidPublishLiveEventPayloadError } from "./domain/model/NotAValidPublishLiveEventPayloadError";
import { OngoingLiveEventDomainModelSchema } from "./domain/model/OngoingLiveEventDomainModel";
import { OPENAPI_TAGS } from "./config";
import { PublishLiveEventDomainModelSchema } from "./domain/model/PublishLiveEventDomainModel";
import { StoreLiveEventDataSource } from "./data/datasource/StoreLiveEventDataSource";
import { StoreLiveEventUseCase } from "./domain/usecase/StoreLiveEventUseCase";
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
            ...NotAValidPublishLiveEventPayloadError.schema(),
            ...UnauthorizedError.schema(),
        },
    };

    async handle(c: AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const liveEventPayload = data.body;

        const dataSource = new StoreLiveEventDataSource(c.env.DB);
        const useCase = new StoreLiveEventUseCase(dataSource);
        await useCase.execute(liveEventPayload.videoId, liveEventPayload.name, liveEventPayload.description);

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

    handleValidationError(errors: z.ZodError["issues"]): Response {
        throw new NotAValidPublishLiveEventPayloadError("Failed to convert payload to PublishLiveEventDomainModel", errors);
    }
}
