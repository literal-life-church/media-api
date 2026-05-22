import { LiveStreamingResponseDomainModel } from "./LiveStreamingResponseDomainModel";

import { STREAM_HUB_CLOSE_CONNECTION_EVENT_NAME, STREAM_HUB_CLOSING_STATUSES, STREAM_HUB_PING_INTERVAL_MS, STREAM_HUB_STATE_TRANSITION_EVENT_NAME } from "../../../config";

export function SubscribeLiveEventDomainModelSchema() {
    return {
        "200": {
            description: `A stream of Server-Sent Events to indicate when a Live Event transitions its state. There are two events emitted by this stream: \`${STREAM_HUB_STATE_TRANSITION_EVENT_NAME}\` and \`${STREAM_HUB_CLOSE_CONNECTION_EVENT_NAME}\`.\n\nThe \`${STREAM_HUB_STATE_TRANSITION_EVENT_NAME}\` event and its \`data\` field contains the current state of the live event. The \`${STREAM_HUB_CLOSE_CONNECTION_EVENT_NAME}\` contains an empty \`data\` field. A \`: ping\` comment is sent every ${(STREAM_HUB_PING_INTERVAL_MS) / 1000} seconds to keep the connection alive.\n\nWhenever receiving an \`${STREAM_HUB_CLOSE_CONNECTION_EVENT_NAME}\` event, the client should call \`eventSource.close()\` upon receiving this event to prevent automatic reconnection. The server sends the close event and then closes the connection when the event transitions to any of these states: ${Array.from(STREAM_HUB_CLOSING_STATUSES).map((status) => `\`${status}\``).join(", ")}.\n\nAdditionally, any client that subscribes while the event is already \`canceled\` will immediately receive the \`${STREAM_HUB_CLOSE_CONNECTION_EVENT_NAME}\` event.`,
            content: {
                "text/event-stream": {
                    schema: LiveStreamingResponseDomainModel,
                },
            },
        },
    };
}
