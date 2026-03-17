import { contentJson } from "chanfana";
import { z } from "zod";

import { LiveStreamingResponseDomainModel } from "./LiveStreamingResponseDomainModel";

export const PrewarmingLiveEventDomainModel = LiveStreamingResponseDomainModel.extend({
    "status": z.literal("prewarming").openapi({ example: "prewarming" }),
    "event": z.null(),
    "cancellation": z.null(),
}).describe("Response object for prewarm requests. Describes the metadata of a prewarming live event, which indicates the stream has been created on YouTube but has not yet gone live. Both the `event` and `cancellation` fields are always `null` for a prewarming event.");

export function PrewarmingLiveEventDomainModelSchema() {
    return {
        "201": {
            description: "The live event has been successfully set to a prewarming state",
            ...contentJson(PrewarmingLiveEventDomainModel)
        }
    };
}
