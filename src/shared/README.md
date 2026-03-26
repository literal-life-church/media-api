# Shared

Cross-cutting concerns used by all feature modules. Nothing in this directory is specific to any single domain.

## Contents

- **`AuthMiddleware.ts`** — Hono middleware that validates the HMAC-SHA256 bearer token on all protected routes
- **`config.ts`** — shared configuration, such as environment types and authorization constants
- **`data/datasource/EnvironmentVariableDataSource.ts`** — thin wrapper around `process.env`
- **`data/mapper/`** — shared mappers used across domains
- **`domain/model/error/`** — `HttpError` base class and common error subclasses
- **`domain/model/response/`** — shared response schemas (e.g., `NoContentDomainModel`)
- **`domain/usecase/ValidateAuthorizationUseCase.ts`** — HMAC-SHA256 signature validation logic

## When to Add Something Here

Only add code to `shared/` if it is genuinely used by two or more feature modules. Domain-specific helpers belong in the feature module, not here.

## Error Handling

`HttpError` (`domain/model/error/HttpError.ts`) is the base class for all application errors. Key properties:

- `statusCode` — HTTP status code (defined as a static on each subclass)
- `publicMessage` — the message shown to API consumers (safe to expose)
- `internalMessage` — detailed message for debugging; only included in responses when `IS_DEV` is true
- `errorName` — machine-readable error identifier
- `schemaDescription` — used to generate the OpenAPI error schema via `.schema()`

When you declare a new error type, like `UnauthorizedError`, create a class which extends `HttpError` and set these properties:

```typescript
export class UnauthorizedError extends HttpError {
    static readonly statusCode = 401;
    static readonly publicMessage = "You are not authorized to perform this action";
    static readonly errorName = "UnauthorizedError";
    static readonly schemaDescription = "The request was rejected because the Bearer token was missing or incorrect";
}
```

`HttpError` will then use this information to generate an OpenAPI schema. You can use it with Chanfana by calling the static `.schema()` function like this:

```typescript
export class ExampleController extends OpenAPIRoute {
    schema = {
        responses: {
            ...UnauthorizedError.schema(),
        },
    };

    // ...
}
```

When `throw`ing the error, you have access to three properties in the constructor, two of which are optional:

```typescript
throw new UnauthorizedError(
    "Missing the Authorization header",            // Required technical message shown internally
    cause,                                         // Optional
    "Custom public message shown to the caller"    // Optional public message, overrides the static publicMessage property
);
```
