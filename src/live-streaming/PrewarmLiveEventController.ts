import { OpenAPIRoute, RouteOptions } from "chanfana";
import { z } from "zod";

import type { AppContext } from "../index";
import { NotAValidPrewarmLiveEventPayloadError } from "./domain/model/error/NotAValidPrewarmLiveEventPayloadError";
import { OPENAPI_TAGS } from "./config";
import { PrewarmingLiveEventDomainModelSchema } from "./domain/model/response/PrewarmingLiveEventDomainModel";
import { PrewarmLiveEventDomainModelSchema } from "./domain/model/request/PrewarmLiveEventDomainModel";
import { PrewarmLiveEventUseCase } from "./domain/usecase/PrewarmLiveEventUseCase";
import { StatusOnlyEventMapper } from "./data/mapper/StatusOnlyEventMapper";
import { UnauthorizedError } from "../shared/domain/model/error/UnauthorizedError";

export class PrewarmLiveEventController extends OpenAPIRoute {
    constructor(
        params: RouteOptions,
        private readonly mapper: StatusOnlyEventMapper = new StatusOnlyEventMapper()
    ) {
        super(params);
    }

    schema = {
        tags: OPENAPI_TAGS,
        summary: "Set a Live Event on YouTube to a prewarming state",
        request: {
            ...PrewarmLiveEventDomainModelSchema(),
        },
        responses: {
            ...PrewarmingLiveEventDomainModelSchema(),
            ...NotAValidPrewarmLiveEventPayloadError.schema(),
            ...UnauthorizedError.schema(),
        },
    };

    async handle(c: AppContext) {
        const useCase = new PrewarmLiveEventUseCase(
            c.env.DB,
            c.env.EVENT_CANCELLATION_EXPIRATION_JOB,
            c.env.STREAM_HUB
        );

        await useCase.execute();
        return c.json(this.mapper.map("prewarming"), 201);
    }

    handleValidationError(errors: z.ZodError["issues"]): Response {
        throw new NotAValidPrewarmLiveEventPayloadError("Failed to convert payload to PrewarmLiveEventDomainModel", errors);
    }
}
