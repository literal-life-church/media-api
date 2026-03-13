import { contentJson } from "chanfana";
import { z } from "zod";

import { AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS, AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS } from "../../../shared/config";

export const CancelEventDomainModel = z.object({
    "reason": z.string()
        .describe("A user-facing message explaining the reason for the cancellation of the live event. Supports Markdown.")
        .openapi({ example: "The live event was canceled due to unforeseen circumstances." }),
    "name": z.string()
        .describe("Name of the live event that was canceled")
        .openapi({ example: "Weekly Outreach Event, 06/01/2026" }),
    "timeOfEvent": z.iso.datetime()
        .describe("The time in UTC when the live event was scheduled to go live, in ISO 8601 format")
        .openapi({ example: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }), // Default to 1 day in the future
    "cancellationExpiration": z.number().int().positive()
        .describe("The number of milliseconds after `timeOfEvent` that this cancellation notice will automatically expire, sending the event back to an offline state")
        .openapi({ example: 7200000 }),
    "requestTime": z.iso.datetime()
        .describe(`The time in UTC this request was made, in ISO 8601 format. Must be within ${AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS}ms before to ${AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS}ms after the current time to prevent replay attacks.`)
        .openapi({ example: new Date().toISOString() }),
}).describe("The data model for canceling an expected, normally scheduled live event, which includes the reason for cancellation, the name of the event, the originally scheduled time of the event, the cancellation expiration duration, and the time the request was made.");

export function CancelEventDomainModelSchema() {
    return {
        body: contentJson(CancelEventDomainModel)
    };
}
