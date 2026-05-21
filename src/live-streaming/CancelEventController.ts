import { OpenAPIRoute, RouteOptions } from "chanfana";
import { z } from "zod";

import type { AppContext } from "../index";
import { CanceledEventDomainModelSchema } from "./domain/model/response/CanceledEventDomainModel";
import { CanceledEventMapper } from "./data/mapper/CanceledEventMapper";
import { CancelEventDomainModelSchema } from "./domain/model/request/CancelEventDomainModel";
import { CancelEventUseCase } from "./domain/usecase/CancelEventUseCase";
import { NotAValidCancelEventPayloadError } from "./domain/model/error/NotAValidCancelEventPayloadError";
import { OPENAPI_TAGS } from "./config";
import { UnauthorizedError } from "../shared/domain/model/error/UnauthorizedError";

export class CancelEventController extends OpenAPIRoute {
    constructor(
        params: RouteOptions,
        private readonly mapper: CanceledEventMapper = new CanceledEventMapper()
    ) {
        super(params);
    }

    schema = {
        tags: OPENAPI_TAGS,
        summary: "Marks an expected, normally scheduled Live Event on YouTube as canceled",
        request: {
            ...CancelEventDomainModelSchema(),
        },
        responses: {
            ...CanceledEventDomainModelSchema(),
            ...NotAValidCancelEventPayloadError.schema(),
            ...UnauthorizedError.schema(),
        },
    };

    async handle(c: AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const payload = data.body;

        const useCase = new CancelEventUseCase(
            c.env.DB,
            c.env.EVENT_CANCELLATION_EXPIRATION_JOB,
            c.env.STREAM_HUB
        );

        await useCase.execute(
            payload.name,
            payload.reason,
            payload.timeOfEvent,
            payload.cancellationExpiration
        );

        return c.json(this.mapper.map(
            payload.name,
            payload.reason,
            payload.timeOfEvent
        ), 201);
    }

    handleValidationError(errors: z.ZodError["issues"]): Response {
        throw new NotAValidCancelEventPayloadError("Failed to convert payload to CancelEventDomainModel", errors);
    }
}
