import { contentJson } from "chanfana";
import { z } from "zod";

import { LiveStreamingResponseDomainModel } from "./LiveStreamingResponseDomainModel";

export const CanceledLiveEventDomainModel = LiveStreamingResponseDomainModel.extend({
    "event": z.null()
}).describe("Describes the metadata of a canceled live event, which includes the current status of the event (always `canceled`, in this scenario), and the details of the cancellation. The `event` field is always null for a canceled event.");

export function CanceledLiveEventDomainModelSchema() {
    return {
        "201": {
            description: "Returns the captured metadata for the canceled live event",
            ...contentJson(CanceledLiveEventDomainModel)
        }
    };
}
