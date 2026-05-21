# Push Notifications

This module is a generic transport layer for sending push notifications via [OneSignal](https://onesignal.com/). It knows nothing about specific notification types — domain-specific wrappers that build payloads live in their respective domain modules.

## Architecture

```text
Domain-Specific UseCase (builds payload)
  → SendPushNotificationUseCase (POSTs to OneSignal)
     ↑ IdempotencyCalculatorUseCase (generates UUID v5 key)
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `PUSH_API_KEY` | OneSignal REST API key (`Key <value>` in the `Authorization` header) |
| `PUSH_APP_ID` | OneSignal app ID sent in the request body |
| `PUSH_BADGE_URL` | URL of the small badge icon shown in Android system trays |
| `PUSH_ICON_URL` | URL of the brand/website logo icon shown on Chrome and Firefox |

All values are managed via Doppler and read through `EnvironmentVariableDataSource`.

## Idempotency

Every notification is sent with an `idempotency_key` computed by `IdempotencyCalculatorUseCase`. The key is a UUID v5 (RFC 9562) derived from `JSON.stringify()` of the full OneSignal request body (excluding the key itself), using the `v5.URL` namespace. This ensures that identical payloads produce the same key, allowing OneSignal to deduplicate retried requests.

## Error Handling

`SendPushNotificationUseCase` never throws. On a non-2xx response or network failure it logs the error and returns `false`. Callers should log success or failure based on the return value but must not propagate the failure — push notifications are best-effort.
