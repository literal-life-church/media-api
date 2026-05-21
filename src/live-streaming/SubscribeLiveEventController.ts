import { OpenAPIRoute } from "chanfana";

import type { AppContext } from "../index";
import { OPENAPI_TAGS, STREAM_HUB_ID } from "./config";
import { SubscribeLiveEventDomainModelSchema } from "./domain/model/response/SubscribeLiveEventDomainModel";

export class SubscribeToLiveEventStateChangesController extends OpenAPIRoute {
    schema = {
        tags: OPENAPI_TAGS,
        summary: "Subscribe to Live Event state transitions via Server-Sent Events",
        security: [],
        responses: {
            ...SubscribeLiveEventDomainModelSchema(),
        },
    };

    async handle(c: AppContext): Promise<Response> {
        const objectId = c.env.STREAM_HUB.idFromName(STREAM_HUB_ID);
        const stub = c.env.STREAM_HUB.get(objectId);
        return stub.fetch(c.req.raw);
    }
}
