# Shared Module — Agent Guidance

## AuthMiddleware

`AuthMiddleware.ts` is a Hono middleware registered in `src/index.ts` on all protected route paths. It delegates to `ValidateAuthorizationUseCase`, which:

1. Extracts the `Authorization: Bearer <token>` header
2. Reads `requestTime` from the request body
3. Validates that `requestTime` is within ±1 minute of the current time (replay attack prevention)
4. Validates the HMAC-SHA256 signature of the request body against `AUTHORIZATION_SIGNING_SECRET`

The middleware is applied via `openapi.use("/live-streaming/*", AuthMiddleware)`. The `GET /live-streaming` endpoint is registered **before** the middleware and is therefore public.

## Error Hierarchy

`HttpError` (`domain/model/error/HttpError.ts`) is the base class for all application errors. Key properties:

- `statusCode` — HTTP status code (defined as a static on each subclass)
- `publicMessage` — the message shown to API consumers (safe to expose)
- `internalMessage` — detailed message for debugging; only included in responses when `IS_DEV` is true
- `errorName` — machine-readable error identifier
- `schemaDescription` — used to generate the OpenAPI error schema via `.schema()`

The third constructor parameter allows overriding the public message per throw site:

```typescript
throw new NotAValidCancelEventPayloadError(
    "Internal detail here",
    cause,
    "Custom public message shown to the caller"
);
```

When creating a new error type, extend `HttpError` and define `statusCode`, `publicMessage`, `errorName`, and `schemaDescription` as static properties. Call `.schema()` in the controller's `responses` block to include it in the OpenAPI spec.

## Environment Config

`config.ts` is the single source of truth for environment flags and authorization constants.

- `IS_DEV` — true when `NODE_ENV === "development"` (the default when unset)
- `IS_PROD` — true when `NODE_ENV === "production"`
- Authorization constants: signing algorithm, timestamp window (±1 minute), encoding format

`NODE_ENV` is read via `EnvironmentVariableDataSource`. Do not read `process.env` directly anywhere in the codebase — always use `EnvironmentVariableDataSource` or the pre-computed constants from `config.ts`.

## EnvironmentVariableDataSource

`data/datasource/EnvironmentVariableDataSource.ts` is a thin wrapper around `process.env`. All environment variable access in the project must go through this function so the access point is consistent and mockable.

## Shared Mappers

`data/mapper/` contains reusable mappers:

- `GenericMapper<Input, Output>` — base interface for **single-input** mappers. Extend this only when the `map()` function takes a single parameter. For mappers with multiple inputs, define explicit named parameters without extending `GenericMapper<>`.
- `PayloadToRequestTimeMapper` — extracts `requestTime` from a request payload
- `StringToHmacSignatureMapper` — computes an HMAC-SHA256 signature from a string
