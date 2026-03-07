import { contentJson, DateTime, Obj, Str } from "chanfana";

import { AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS, AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS } from "../../../shared/config";

export const PublishLiveEventDomainModel = Obj({
    "videoId": Str({
        example: "abc123",
        description: "YouTube video ID for the live event. This is the unique identifier for the video and can be found in the YouTube URL (e.g. `https://www.youtube.com/watch?v=abc123`). In this case, the video ID is `abc123`.",
        required: true
    }),
    "name": Str({
        example: "Weekly Outreach Event, 06/01/2026",
        description: "Name of the live event as published on YouTube",
        required: true
    }),
    "description": Str({
        example: "Join us for our Weekly Outreach Event as we discuss community initiatives and upcoming events.",
        description: "Description of the live event as published on YouTube, in plain text format",
        required: true
    }),
    "requestTime": DateTime({
        example: new Date().toISOString(),
        description: `The time in UTC this request was made, in ISO 8601 format. Must be within ${AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS}ms before to ${AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS}ms after the current time to prevent replay attacks.`,
        required: true
    }),
}, {
    description: "The data model for publishing a live event, which includes the YouTube video ID, name, description, and the time the request was made.",
});

export function PublishLiveEventDomainModelSchema() {
    return {
        body: contentJson(PublishLiveEventDomainModel)
    };
}
