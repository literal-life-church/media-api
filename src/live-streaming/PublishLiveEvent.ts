import { OpenAPIRoute, RouteOptions } from "chanfana";
import { z } from "zod";

import { type AppContext } from "../types";
import { LiveEventMapper } from "./data/mapper/LiveEventMapper";
import { NotAValidPublishLiveEventPayloadError } from "./domain/model/error/NotAValidPublishLiveEventPayloadError";
import { OngoingLiveEventDomainModelSchema } from "./domain/model/response/OngoingLiveEventDomainModel";
import { OPENAPI_TAGS } from "./config";
import { PublishLiveEventDomainModelSchema } from "./domain/model/request/PublishLiveEventDomainModel";
import { StoreLiveEventUseCase } from "./domain/usecase/StoreLiveEventUseCase";
import { UnauthorizedError } from "../shared/domain/model/error/UnauthorizedError";

export class PublishLiveEvent extends OpenAPIRoute {
    constructor(
        params: RouteOptions,
        private readonly mapper: LiveEventMapper = new LiveEventMapper()
    ) {
        super(params);
    }

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

        const useCase = new StoreLiveEventUseCase(c.env.DB, c.env.EVENT_CANCELLATION_DO);
        await useCase.execute(liveEventPayload.videoId, liveEventPayload.name, liveEventPayload.description);

        return c.json(this.mapper.map(
            liveEventPayload.videoId,
            liveEventPayload.name,
            liveEventPayload.description
        ), 201);
    }

    handleValidationError(errors: z.ZodError["issues"]): Response {
        throw new NotAValidPublishLiveEventPayloadError("Failed to convert payload to PublishLiveEventDomainModel", errors);
    }
}
