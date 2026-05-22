# Live Streaming Module — Agent Guidance

## File Naming

| Suffix | Location | Purpose |
| --- | --- | --- |
| `*Controller.ts` | `src/live-streaming/` | HTTP route handlers (extend `OpenAPIRoute`) |
| `*DurableObject.ts` | `src/live-streaming/` | Long-lived singleton operations |
| `*UseCase.ts` | `domain/usecase/` | Business logic; each exposes `execute()` |
| `*DataSource.ts` | `data/datasource/` | All data sources run DB queries via Drizzle ORM |
| `*Mapper.ts` | `data/mapper/` | Each instance transforms data from a DataSource into a `LiveEventResponse` |
| `*DomainModel.ts` | `domain/model/` | Zod schemas for requests and responses |

## Data Flow

```text
Controller → UseCase(s) → DataSource
```

Controllers instantiate use cases directly. Use cases instantiate data sources directly. All dependencies use constructor injection with default parameter values.

## Durable Objects

This domain uses two Durable Objects.

### `EventCancellationExpirationJobDurableObject`

A **domain-level controller** triggered by the CF Alarm API. It lives at the top level of `src/live-streaming/` alongside route controllers because it follows the same architectural tier. When its alarm fires, it clears the `live_events` table and broadcasts the resulting `offline` state.

### `StreamHubDurableObject`

A **persistent SSE hub** that holds open `WritableStreamDefaultWriter` connections for all active subscribers. It exposes two internal HTTP paths (called via `stub.fetch()`):

- `POST /broadcast` — reads a `LiveEventResponse` JSON body, encodes it as an `event.state_transition` SSE event, and writes it to all connected writers. For closing statuses (`offline`, `canceled`), also writes `event.close_connection` and closes each writer. If status is `canceled`, also persists a `canceled` flag in DO storage.
- `GET /subscribe` (via the route `/live-streaming/subscribe`) — returns a streaming `text/event-stream` response. If DO storage holds a `canceled` flag, immediately sends `event.close_connection` and closes. Otherwise, registers a new writer, sets up an abort listener for client disconnection, and starts a `pingLoop` (via `ctx.waitUntil`) that writes `: ping` SSE comments every 30 seconds.

Both DOs must be re-exported from `src/index.ts`:

```typescript
export { EventCancellationExpirationJobDurableObject } from "./live-streaming/EventCancellationExpirationJobDurableObject";
export { StreamHubDurableObject } from "./live-streaming/StreamHubDurableObject";
```

## Push Notifications

`SendGoLivePushNotificationUseCase` and `SendCancellationPushNotificationUseCase` are domain-specific wrappers that build a notification payload and delegate to `SendPushNotificationUseCase` from `src/push-notifications/`. Each logs success or failure and never throws — push notifications are best-effort.

- `SendGoLivePushNotificationUseCase.execute(eventName, videoId)` — called at the end of `PublishLiveEventUseCase.execute()`
- `SendCancellationPushNotificationUseCase.execute(eventName, timeOfEvent, reason)` — called at the end of `CancelEventUseCase.execute()`

## Write Endpoint Rule

Every write endpoint (`go-live`, `cancel`, `prewarm`, `DELETE`) must call `DeleteEventCancellationExpirationJobUseCase` **before** its primary DB operation. This cancels any pending DO alarm and removes the corresponding `active_jobs` row, preventing a stale alarm from firing after the state has changed.

## Broadcast Rule

Every write endpoint that changes event state must call `BroadcastStateTransitionUseCase` **after** its primary DB operation. This reads the current state from D1 and POSTs it to `StreamHubDurableObject`'s `/broadcast` path, pushing the transition to all active SSE subscribers.

This is important since the `BroadcastStateTransitionUseCase` reads the DB for the current state before sending the transition to all subscribers.
