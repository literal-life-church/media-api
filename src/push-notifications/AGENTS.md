# Push Notifications Module — Agent Guidance

## File Naming

| Suffix | Location | Purpose |
| --- | --- | --- |
| `*UseCase.ts` | `domain/usecase/` | Business logic; each exposes `execute()` |
| `*DomainModel.ts` | `domain/model/` | Plain TypeScript interfaces for outbound payloads (no Zod — these are constructed, not validated) |

## Responsibility Boundary

This module owns the **transport only**. It never decides what to send or when. Domain-specific wrappers that build payloads and choose segment names, titles, and bodies live in their respective feature modules:

- `src/live-streaming/domain/usecase/SendGoLivePushNotificationUseCase.ts`
- `src/live-streaming/domain/usecase/SendCancellationPushNotificationUseCase.ts`

Do not add feature-specific logic here. If a new notification type is needed, create a new wrapper use case in the relevant feature module and call `SendPushNotificationUseCase` from it.

## Data Flow

```text
Feature UseCase
     → SendPushNotificationUseCase → fetch (OneSignal REST API)
         ↑ IdempotencyCalculatorUseCase
```

## `PushNotificationPayloadDomainModel`

The interface that callers must satisfy. `thumbnailUrl` is optional — omit it when there is no relevant image. All other fields are required.

`app_id`, `target_channel`, and `idempotency_key` are **not** in this interface — `SendPushNotificationUseCase` adds them internally from `config.ts` or as a calculated value.

## `SendPushNotificationUseCase`

- Builds the full OneSignal request body from the payload and the constants in `config.ts`
- Computes `idempotency_key` via `IdempotencyCalculatorUseCase` before merging it into the body
- POSTs to `PUSH_API_URL` with `Authorization: Key ${PUSH_API_KEY}` and `Content-Type: application/json`
- Returns `true` on success, `false` on non-2xx or network failure (never throws)

## `IdempotencyCalculatorUseCase`

Synchronous. Serializes the payload with `JSON.stringify()` (which removes arbitrary whitespace and silently drops `undefined` values, so omitted optional fields do not affect the key) and hashes it with UUID v5 using `v5.URL` as the namespace. The `uuid` package provides a pure-JS implementation — no `crypto` runtime dependency.

Using UUID v5 makes this work like a stable hash. All values of the same type will produce the same UUID, which is important for idempotency.

## Adding a New Notification Type

1. Create a wrapper use case in the feature module (e.g., `src/<feature>/domain/usecase/Send<Type>PushNotificationUseCase.ts`)
2. Add notification-specific constants (segment, name, group ID, TTL) to the feature module's `config.ts`
3. Build a `PushNotificationPayloadDomainModel` and call `SendPushNotificationUseCase.execute(payload)`
4. Log success/failure in the wrapper; do not propagate errors
5. Call the wrapper use case to send your domain-specific push notification
