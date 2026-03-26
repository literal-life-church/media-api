import { contentJson } from "chanfana";
import { z } from "zod";

import { LiveStreamingResponseDomainModel } from "./LiveStreamingResponseDomainModel";

export type LiveEventResponse = z.infer<typeof LiveStreamingResponseDomainModel>;

export function LiveEventStatusDomainModelSchema() {
    return {
        "200": {
            description: "Returns the current status of the live event or details on why it was canceled",
            ...contentJson(LiveStreamingResponseDomainModel)
        }
    };
}
