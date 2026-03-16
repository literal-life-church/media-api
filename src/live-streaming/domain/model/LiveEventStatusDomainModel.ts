import { contentJson } from "chanfana";

import { LiveStreamingResponseDomainModel } from "./LiveStreamingResponseDomainModel";

export function LiveEventStatusDomainModelSchema() {
    return {
        "200": {
            description: "Returns the current status of the live event or details on why it was canceled",
            ...contentJson(LiveStreamingResponseDomainModel)
        }
    };
}