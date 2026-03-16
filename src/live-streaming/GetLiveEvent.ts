import { OpenAPIRoute } from "chanfana";

import { type AppContext } from "../types";
import { GetLiveEventUseCase } from "./domain/usecase/GetLiveEventUseCase";
import { LiveEventStatusDomainModelSchema } from "./domain/model/LiveEventStatusDomainModel";
import { OPENAPI_TAGS } from "./config";

export class GetLiveEvent extends OpenAPIRoute {
    schema = {
        tags: OPENAPI_TAGS,
        summary: "Get the current status of the Live Event or details on why it was canceled",
        security: [],
        responses: {
            ...LiveEventStatusDomainModelSchema(),
        },
    };

    async handle(c: AppContext) {
        const useCase = new GetLiveEventUseCase(c.env.DB);
        const result = await useCase.execute();
        return c.json(result, 200);
    }
}
