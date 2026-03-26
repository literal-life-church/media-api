# Live Streaming

This module manages all live event state transitions for YouTube live streams. It stores event metadata in Cloudflare D1 and uses a Cloudflare Durable Object alarm to automatically expire cancellation notices.

## Status Lifecycle

```text
offline → prewarming → live → offline
                     ↘ canceled → offline (auto-expiration via DO alarm)
```

- **offline** — no event data exists (default state)
- **prewarming** — a live event has been created on YouTube but the broadcast has not yet started
- **live** — the event is actively streaming
- **canceled** — the event has been canceled; includes reason, event name, and original scheduled time

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/live-streaming` | No | Returns the current event status and metadata |
| `POST` | `/live-streaming/go-live` | Yes | Publishes a live event with YouTube video ID, name, and description |
| `POST` | `/live-streaming/cancel` | Yes | Marks an event as canceled with a reason, event name, and scheduled time |
| `POST` | `/live-streaming/prewarm` | Yes | Sets the event to a prewarming state |
| `DELETE` | `/live-streaming` | Yes | Unpublishes the event, returning it to an offline state |

## Cancellation Expiration

When `POST /live-streaming/cancel` is called, a Cloudflare Durable Object alarm is scheduled to fire at `timeOfEvent + cancellationExpiration` milliseconds. When the alarm fires, the `live_events` table is cleared and the event returns to an `offline` state automatically.

Any subsequent write endpoint (`go-live`, `prewarm`, `DELETE`) cancels any pending expiration alarm as part of its operation.
