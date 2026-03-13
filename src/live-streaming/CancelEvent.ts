import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

import { type AppContext } from "../types";
import { CancelEventDomainModelSchema } from "./domain/model/CancelEventDomainModel";
import { CanceledLiveEventDomainModelSchema } from "./domain/model/CanceledLiveEventDomainModel";
import { NotAValidCancelEventPayloadError } from "./domain/model/NotAValidCancelEventPayloadError";
import { OPENAPI_TAGS } from "./config";
import { UnauthorizedError } from "../shared/domain/model/UnauthorizedError";

export class CancelEvent extends OpenAPIRoute {
    schema = {
        tags: OPENAPI_TAGS,
        summary: "Marks an expected, normally scheduled Live Event on YouTube as canceled",
        request: {
            ...CancelEventDomainModelSchema(),
        },
        responses: {
            ...CanceledLiveEventDomainModelSchema(),
            ...NotAValidCancelEventPayloadError.schema(),
            ...UnauthorizedError.schema(),
        },
    };

    async handle(c: AppContext) {
        const data = await this.getValidatedData<typeof this.schema>();
        const payload = data.body;

        return c.json({
            status: "canceled",
            event: null,
            cancellation: {
                reason: payload.reason,
                name: payload.name,
                timeOfEvent: payload.timeOfEvent,
            },
        }, 201);
    }

    handleValidationError(errors: z.ZodError["issues"]): Response {
        throw new NotAValidCancelEventPayloadError("Failed to convert payload to CancelEventDomainModel", errors);
    }
}
