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
