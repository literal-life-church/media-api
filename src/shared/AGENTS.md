# Shared Module — Agent Guidance

## AuthMiddleware

`AuthMiddleware.ts` is a Hono middleware registered in `src/index.ts` on all protected route paths. It delegates to `ValidateAuthorizationUseCase`, which:

1. Extracts the `Authorization: Bearer <token>` header
2. Reads `requestTime` from the request body
3. Validates that `requestTime` is within ±1 minute of the current time (replay attack prevention)
4. Validates the HMAC-SHA256 signature of the request body against `AUTHORIZATION_SIGNING_SECRET`

The middleware is applied via `openapi.use("/live-streaming/*", AuthMiddleware)`. The `GET /live-streaming` endpoint is registered **before** the middleware and is therefore public.

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
