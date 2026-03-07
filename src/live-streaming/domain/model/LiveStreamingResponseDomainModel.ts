import { DateTime, Enumeration, Obj, Str } from "chanfana";

export const LiveStreamingResponseDomainModel = Obj({
    "status": Enumeration({
        example: "live",
        description: "The current status of the live event. Can be `canceled`, `live`, `offline`, or `prewarming`.",
        values: ["canceled", "live", "offline", "prewarming"],
        required: true
    }),
    "event": Obj({
        "embedUrl": Str({
            example: "https://www.youtube.com/embed/abc123",
            description: "The URL for embedding the live event video. This is the URL that can be used in an <iframe> to display the live video on a website.",
            required: true
        }),
        "watchUrl": Str({
            example: "https://www.youtube.com/live/abc123",
            description: "The URL for watching the live event on YouTube. This is the standard YouTube URL for the video.",
            required: true
        }),
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
        })
    }, {
        description: "The details of the live event, including the video URLs, name, description, and link publication time. Only present when the `status` is `live`.",
        required: false
    }).nullable(),
    "cancellation": Obj({
        "reason": Str({
            example: "The live event was canceled due to unforeseen circumstances.",
            description: "A user-facing message explaining the reason for the cancellation of the live event",
            required: true
        }),
        "name": Str({
            example: "Weekly Outreach Event, 06/01/2026",
            description: "Name of the live event that would have been published on YouTube",
            required: true
        }),
        "timeOfEvent": DateTime({
            example: new Date().toISOString(), // Generates now time in ISO format
            description: "The time in UTC when the live event was scheduled to go live, in ISO 8601 format",
            required: true
        })
    }, {
        description: "The details of the cancellation, including the reason for cancellation, name of the event, scheduled time of the event, and time of cancellation. Only present when the `status` is `canceled`.",
        required: false
    }).nullable(),
}, {
    description: "Describes all possible states of a live event, which includes the current status of the event (canceled, live, offline, prewarming), the details of the live event if it is currently live, and the details of the cancellation if it has been canceled. The `event` field is only present when the status is `live`, and the `cancellation` field is only present when the status is `canceled`. If the status is `offline` or `prewarming`, neither the `event` nor `cancellation` fields will be present.",
});
