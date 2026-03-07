import { contentJson } from "chanfana";
import { z } from "zod";

import { LiveStreamingResponseDomainModel } from "./LiveStreamingResponseDomainModel";

export const OngoingLiveEventDomainModel = LiveStreamingResponseDomainModel.extend({
    "cancellation": z.null()
}).describe("Describes the metadata of a live event, which includes the current status of the event (always `live`, in this scenario), and the details of the live event. The `cancellation` field is always null for an ongoing live event, as it has not been canceled.");

export function OngoingLiveEventSchema() {
    return {
        "201": {
            description: "Returns the captured and transformed metadata for the published Live Event",
            ...contentJson(OngoingLiveEventDomainModel)
        }
    };
}
