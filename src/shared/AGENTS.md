# Shared Module — Agent Guidance

## AuthMiddleware

`AuthMiddleware.ts` is a Hono middleware registered in `src/index.ts` on all protected route paths. It delegates to `ValidateAuthorizationUseCase`, which:

1. Extracts the `Authorization: Bearer <token>` header
2. Reads `requestTime` from the request body
3. Validates that `requestTime` is within ±1 minute of the current time (replay attack prevention)
4. Validates the HMAC-SHA256 signature of the request body against `AUTHORIZATION_SIGNING_SECRET`

The middleware is applied via `openapi.use("/live-streaming/*", AuthMiddleware)`. The `GET /live-streaming` endpoint is registered **before** the middleware and is therefore public.

## CorsMiddleware

`CorsMiddleware.ts` is a Hono middleware registered globally in `src/index.ts` via `app.use("*", CorsMiddleware)`. It runs on every request before any route handler.

It always sets:

- `Connection: keep-alive`
- `Vary` — appends the value of `CORS_VARY` to any existing `Vary` header
- `X-Powered-By` — value of `X_POWERED_BY`

When the request includes an `Origin` header that matches one of the entries in `CORS_ALLOWED_ORIGINS` (a comma-separated env var), it additionally sets:

- `Access-Control-Allow-Origin` — the matched origin (exact value, not a wildcard)
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Headers` — value of `CORS_ALLOWED_HEADERS`
- `Access-Control-Allow-Methods` — value of `CORS_ALLOWED_METHODS`

If the origin does not match (or no `Origin` header is present), the `Access-Control-Allow-*` headers are omitted entirely.

For `OPTIONS` preflight requests with a matched origin, the middleware short-circuits with `204 No Content` before calling `next()`.

All five CORS env vars (`CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_HEADERS`, `CORS_ALLOWED_METHODS`, `CORS_VARY`, `X_POWERED_BY`) are defined in `config.ts` and managed via Doppler.

## Environment Config

`config.ts` is the single source of truth for environment flags and authorization constants.

- `IS_DEV` — true when `NODE_ENV === "development"` (the default when unset)
- `IS_STAGING` — true when `NODE_ENV === "staging"`
- `IS_PROD` — true when `NODE_ENV === "production"`
- Authorization constants: signing algorithm, timestamp window (±1 minute), encoding format

`NODE_ENV` is read via `EnvironmentVariableDataSource`. Do not read `process.env` directly anywhere in the codebase — always use `EnvironmentVariableDataSource` or the pre-computed constants from `config.ts`.

## Error Handlers

To create a new error type, declare it in the OpenAPI schema, and throw the custom error, see the **Error Handling** section inside of `./README.md`.

## Shared Mappers

`data/mapper/` contains reusable mappers:

- `GenericMapper<Input, Output>` — base interface for **single-input** mappers. Extend this only when the `map()` function takes a single parameter. For mappers with multiple inputs, define explicit named parameters without extending `GenericMapper<>`.
- `PayloadToRequestTimeMapper` — extracts `requestTime` from a request payload
- `StringToHmacSignatureMapper` — computes an HMAC-SHA256 signature from a string
