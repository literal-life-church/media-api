# Live Streaming

This module manages all live event state transitions for YouTube live streams. It stores event metadata in Cloudflare D1 and uses Cloudflare Durable Objects to:

- Sse the Alarm API to automatically expire cancellation notices.
- Stream Live Event state transition updates to active, listening subscribers.

## Status Lifecycle

```text
offline → prewarming → live → offline
        ↘ canceled → offline (auto-expiration via DO alarm)
(cancellation can occur at any point, but typically from offline)
```

- **offline** — no event data exists (default state)
- **prewarming** — a live event has been created on YouTube but the broadcast has not yet started
- **live** — the event is actively streaming
- **canceled** — the event has been canceled; includes reason, event name, and original scheduled time

## Endpoints

These are all of the endpoints within this domain. You can try them out by visiting the Swagger UI at <http://localhost:8787/try>.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/live-streaming` | No | Returns the current event status and metadata |
| `GET` | `/live-streaming/subscribe` | No | Opens a Server-Sent Events stream that delivers real-time state transitions |
| `POST` | `/live-streaming/go-live` | Yes | Publishes a live event with YouTube video ID, name, and description |
| `POST` | `/live-streaming/cancel` | Yes | Marks an event as canceled with a reason, event name, and scheduled time |
| `POST` | `/live-streaming/prewarm` | Yes | Sets the event to a prewarming state |
| `DELETE` | `/live-streaming` | Yes | Unpublishes the event, returning it to an offline state |

## Server-Sent Events

`GET /live-streaming/subscribe` opens a persistent `text/event-stream` connection backed by `StreamHubDurableObject`. The `SubscribeLiveEventController` proxies the request directly to the DO via `stub.fetch()` and returns the streaming response as-is.

### Events

| Event name | Payload | When sent |
| --- | --- | --- |
| `event.state_transition` | Current `LiveEventResponse` JSON | On every state transition broadcast |
| `event.close_connection` | `{}` (empty) | Immediately before the server closes the connection |
| `: ping` (SSE comment) | — | Every 30 seconds to keep the connection alive |

### Closing behavior

When the event transitions to `offline`, the server:

1. Sends `event.state_transition` with the new state
2. Sends `event.close_connection`
3. Closes the writer

Anytime the event is in the `canceled`, the server:

1. Immediately sends `event.close_connection`
2. Closes the writer

Clients must listen for `event.close_connection` and call `eventSource.close()` to suppress the browser's automatic reconnect. We do NOT send a `204` at any point, which is [the conventional signal](https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events-intro) for the client to no longer attempt a reconnection.

If a client subscribes while the event is already in the `canceled` state, it immediately receives `event.close_connection` and the connection closes. Subscribing during `offline` is valid — the client remains connected and waits for the next transition.

This is implemented this way to prevent a bit of a stateful catch-22. For the simple scenario, _anytime_ an event is in the `canceled` status, we close the connection. Simple and clean.

The `offline` scenario is more complicated. If the user is watching an event that transitions from `live` to `offline` while they were on the web page, the server indicates that the connection should be closed because we expect the user to simply leave the page after the the event concludes. But simply being in the `offline` state isn't always a condition to kick the connection. They could be showing up to an event early, while it is still `offline` and wait for it to transition to `prewarming` and `live`.

Therefore, it isn't the state of being `offline` that should always kick every connection, but whether the user was present during the transition from `live` to `offline` that should kick them. Our sever doesn't know at what point every subscriber joined. Therefore, the best way to keep track of that is on the client-side.

Thus, we simply send the `event.close_connection` as more of a suggestion that the state of the client will know best how to handle. The client is treated as the stateful source of truth in this scenario.

## Cancellation Expiration

When `POST /live-streaming/cancel` is called, a Cloudflare Durable Object alarm is scheduled to fire at `timeOfEvent + cancellationExpiration` milliseconds. When the alarm fires, the `live_events` table is cleared and the event returns to an `offline` state automatically.

Any subsequent write endpoint (`go-live`, `prewarm`, `DELETE`) cancels any pending expiration alarm as part of its operation.

## Push Notifications

Two push notifications are sent via [OneSignal](https://onesignal.com/) as part of the live event lifecycle. Failures are logged but do not affect the response — push notifications use a best-effort approach.

| Trigger | OneSignal Segment | Title | Body |
| --- | --- | --- | --- |
| `POST /live-streaming/go-live` | `go_live` | Now Live | `${name} is now live.` |
| `POST /live-streaming/cancel` | `schedule_updates` | `${name} is Canceled` | `${name} originally scheduled for ${dateTime} is canceled. ${reason}` |

The cancellation notification formats `dateTime` as `Monday, January 1st, 2026 at 12:00 PM` using the timezone configured by the `TZ` environment variable (defaults to `America/New_York`). The `reason` field has Markdown stripped before it is included in the notification body.
