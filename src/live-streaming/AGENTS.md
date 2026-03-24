# Live Streaming Module — Agent Guidance

## File Naming

| Suffix | Location | Purpose |
| --- | --- | --- |
| `*Controller.ts` | `src/live-streaming/` | HTTP route handlers (extend `OpenAPIRoute`) |
| `*DurableObject.ts` | `src/live-streaming/` | CF runtime-triggered domain controllers |
| `*UseCase.ts` | `domain/usecase/` | Business logic; each exposes `execute()` |
| `*DataSource.ts` | `data/datasource/` | DB queries via Drizzle ORM |
| `*Mapper.ts` | `data/mapper/` | Transform data into `LiveEventResponse` |
| `*DomainModel.ts` | `domain/model/` | Zod schemas for requests and responses |

## Data Flow

```text
Controller → UseCase(s) → DataSource
```

Controllers instantiate use cases directly. Use cases instantiate data sources directly. All dependencies use constructor injection with default parameter values.

## The Durable Object

`EventCancellationExpirationJobDurableObject.ts` is a **domain-level controller** — it lives at the top level of `src/live-streaming/` alongside route controllers because it follows the same architectural tier, just triggered by the CF alarm API instead of an HTTP route.

Its `alarm()` handler must **not** call use cases that make outbound RPC calls back to the same DO instance — that deadlocks. Instead, it uses data sources directly.

It must be re-exported from `src/index.ts` so the CF runtime can locate it:

```typescript
export { EventCancellationExpirationJobDurableObject } from "./live-streaming/EventCancellationExpirationJobDurableObject";
```

## Constants

`src/live-streaming/config.ts` holds:

- `EVENT_CANCELLATION_EXPIRATION_JOB_ID` — used as both the DO named instance ID and the `active_jobs` table PK. **Never hardcode this string elsewhere** — always import the constant.
- `OPENAPI_TAGS` — the OpenAPI tag applied to all endpoints in this module.

## Mappers

Three mappers cover the four status values:

| Mapper | Status |
| --- | --- |
| `LiveEventMapper` | `live` |
| `CanceledEventMapper` | `canceled` |
| `StatusOnlyEventMapper` | `offline` or `prewarming` |

## Write Endpoint Rule

Every write endpoint (`go-live`, `cancel`, `prewarm`, `DELETE`) must call `DeleteEventCancellationExpirationJobUseCase` **before** its primary DB operation. This cancels any pending DO alarm and removes the corresponding `active_jobs` row, preventing a stale alarm from firing after the state has changed.

## Constructor Injection Pattern

**Controllers** (extend `OpenAPIRoute`, receive `RouteOptions` from Chanfana):

```typescript
constructor(
    params: RouteOptions,
    private readonly mapper: SomeMapper = new SomeMapper()
) {
    super(params);
}
```

**Use cases** (receive `D1Database` and the DO namespace):

```typescript
constructor(
    d1: D1Database,
    private readonly doNamespace: DurableObjectNamespace<EventCancellationExpirationJobDurableObject>,
    private readonly dataSource: SomeDataSource = new SomeDataSource(d1),
    private readonly cancelJobUseCase: DeleteEventCancellationExpirationJobUseCase = new DeleteEventCancellationExpirationJobUseCase(d1, doNamespace)
) { }
```

Use cases that don't need the DO (e.g., `GetLiveEventUseCase`) omit the `doNamespace` parameter.
