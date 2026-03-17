import { contentJson } from "chanfana";
import { z } from "zod";

import { AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS, AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS } from "../../../../shared/config";

export const PrewarmLiveEventDomainModel = z.object({
    "requestTime": z.iso.datetime()
        .describe(`The time in UTC this request was made, in ISO 8601 format. Must be within ${AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS}ms before to ${AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS}ms after the current time to prevent replay attacks.`)
        .openapi({ example: new Date().toISOString() }),
}).describe("The data model for prewarming a live event, which only includes the time the request was made.");

export function PrewarmLiveEventDomainModelSchema() {
    return {
        body: contentJson(PrewarmLiveEventDomainModel)
    };
}
