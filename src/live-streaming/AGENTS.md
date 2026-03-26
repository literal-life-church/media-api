# Live Streaming Module — Agent Guidance

## File Naming

| Suffix | Location | Purpose |
| --- | --- | --- |
| `*Controller.ts` | `src/live-streaming/` | HTTP route handlers (extend `OpenAPIRoute`) |
| `*DurableObject.ts` | `src/live-streaming/` | CF runtime-triggered domain controllers |
| `*UseCase.ts` | `domain/usecase/` | Business logic; each exposes `execute()` |
| `*DataSource.ts` | `data/datasource/` | All data sources run DB queries via Drizzle ORM |
| `*Mapper.ts` | `data/mapper/` | Each instance transforms data from a DataSource into a `LiveEventResponse` |
| `*DomainModel.ts` | `domain/model/` | Zod schemas for requests and responses |

## Data Flow

```text
Controller → UseCase(s) → DataSource
```

Controllers instantiate use cases directly. Use cases instantiate data sources directly. All dependencies use constructor injection with default parameter values.

## The Durable Object

`EventCancellationExpirationJobDurableObject.ts` is a **domain-level controller** — it lives at the top level of `src/live-streaming/` alongside route controllers because it follows the same architectural tier, just triggered by the CF alarm API instead of an HTTP route.

It must be re-exported from `src/index.ts` so the CF runtime can locate it:

```typescript
export { EventCancellationExpirationJobDurableObject } from "./live-streaming/EventCancellationExpirationJobDurableObject";
```

## Write Endpoint Rule

Every write endpoint (`go-live`, `cancel`, `prewarm`, `DELETE`) must call `DeleteEventCancellationExpirationJobUseCase` **before** its primary DB operation. This cancels any pending DO alarm and removes the corresponding `active_jobs` row, preventing a stale alarm from firing after the state has changed.
