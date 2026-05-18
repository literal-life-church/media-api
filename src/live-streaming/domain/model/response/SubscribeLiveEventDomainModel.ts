import { LiveStreamingResponseDomainModel } from "./LiveStreamingResponseDomainModel";

import { STREAM_HUB_CLOSING_STATUSES, STREAM_HUB_EVENT_NAME, STREAM_HUB_PING_INTERVAL_MS } from "../../../config";

export function SubscribeLiveEventDomainModelSchema() {
    return {
        "200": {
            description: `A stream of Server-Sent Events to indicate when a Live Event transitions its state. Each event is named \`${STREAM_HUB_EVENT_NAME}\` and its \`data\` field contains the current live event state. A \`: ping\` comment is sent every ${(STREAM_HUB_PING_INTERVAL_MS) / 1000} seconds to keep the connection alive. The server closes the connection when the event transitions to any of these states: ${Array.from(STREAM_HUB_CLOSING_STATUSES).map((status) => `\`${status}\``).join(", ")}.`,
            content: {
                "text/event-stream": {
                    schema: LiveStreamingResponseDomainModel,
                },
            },
        },
    };
}
