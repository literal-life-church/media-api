import { OpenAPIRoute } from "chanfana";
import { z } from "zod";

import { type AppContext } from "../types";
import { DeleteLiveEventUseCase } from "./domain/usecase/DeleteLiveEventUseCase";
import { NoContentDomainModelSchema } from "../shared/domain/model/response/NoContentDomainModel";
import { NotAValidUnpublishLiveEventPayloadError } from "./domain/model/error/NotAValidUnpublishLiveEventPayloadError";
import { OPENAPI_TAGS } from "./config";
import { UnauthorizedError } from "../shared/domain/model/error/UnauthorizedError";
import { UnpublishLiveEventDomainModelSchema } from "./domain/model/request/UnpublishLiveEventDomainModel";

export class UnpublishLiveEvent extends OpenAPIRoute {
    schema = {
        tags: OPENAPI_TAGS,
        summary: "Unpublish the metadata for a Live Event on YouTube",
        request: {
            ...UnpublishLiveEventDomainModelSchema(),
        },
        responses: {
            ...NoContentDomainModelSchema("The live event metadata has been successfully taken offline"),
            ...NotAValidUnpublishLiveEventPayloadError.schema(),
            ...UnauthorizedError.schema(),
        },
    };

    async handle(c: AppContext) {
        const useCase = new DeleteLiveEventUseCase(c.env.DB);
        await useCase.execute();

        return c.body(null, 204);
    }

    handleValidationError(errors: z.ZodError["issues"]): Response {
        throw new NotAValidUnpublishLiveEventPayloadError("Failed to convert payload to UnpublishLiveEventDomainModel", errors);
    }
}
