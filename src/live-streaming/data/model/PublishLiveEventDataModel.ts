import { DateTime, Obj, Str } from "chanfana";

export const PublishLiveEventDataModel = Obj({
    "videoId": Str({
        example: "abc123",
        description: "YouTube video ID for the live event. This is the unique identifier for the video and can be found in the YouTube URL (e.g. https://www.youtube.com/watch?v=abc123). In this case, the video ID is 'abc123'.",
        required: true
    }),
    "name": Str({
        example: "Sunday Morning Service, 06/01/2026",
        description: "Name of the live event as published on YouTube",
        required: true
    }),
    "description": Str({
        example: "Join us for our Sunday morning service as we worship together and hear a message from Pastor John.",
        description: "Description of the live event as published on YouTube, in plain text format",
        required: true
    }),
    "requestTime": DateTime({
        example: new Date().toISOString(),
        description: "The time in UTC this request was made, in ISO 8601 format. Must be within 1 minute of the current time to prevent replay attacks.",
        required: true
    }),
}, {
    description: "The data model for publishing a live event, which includes the YouTube video ID, name, description, and the time the request was made.",
});
