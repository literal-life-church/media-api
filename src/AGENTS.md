# Top-Level Information About our Repository

The information in this document applies across the entire `src/` directory and all of its subdirectories.

## Source Modules

The `src/` directory contains two feature modules:

- **`live-streaming/`** — manages all live event state transitions (publish, cancel, prewarm, unpublish, read). See `src/live-streaming/AGENTS.md` for domain-specific guidance.
- **`shared/`** — cross-cutting concerns used by all feature modules: auth middleware, error hierarchy, environment config, and shared mappers. See `src/shared/AGENTS.md` for guidance.

The entry point is `src/index.ts`, which registers all routes, applies auth middleware, and exports the Durable Object class required by the Cloudflare runtime.

## Architecture

This project uses a form of clean architecture. Since this is a backend project, there is some latitude in how view-layer vs. business-layer concerns are defined.

Here is how everything is defined:

- **View layer:** a Controller — a Hono route that extends `OpenAPIRoute` from Chanfana. Files end in `*Controller.ts`. It is the thing in the project that receives or generates JSON. Since JSON is the "view" of our API, that is how the delineation is defined.
- **Business layer:** these layers all reside at a lower level than the view layer and are often imported by the top-level `UseCase` classes.

### Controllers and Domain-Level Controllers

There are two kinds of controllers in this project:

- **Route controllers** (`*Controller.ts`) — HTTP-triggered. Registered in `src/index.ts` via `openapi.get()`, `openapi.post()`, etc.
- **Durable Object controllers** (`*DurableObject.ts`) — CF runtime-triggered (e.g., via alarm). They live at the top level of a feature module, follow the same architectural tier as route controllers, and are exported from `src/index.ts` so the CF runtime can locate them.

### Constructor Injection

All dependencies use constructor injection with default parameter values, making them testable without a DI framework:

All dependencies use constructor injection with default parameter values. This makes every class independently testable without a DI framework.

**UseCases** (with a `D1Database`):

```typescript
constructor(
    d1: D1Database,
    private readonly dataSource: MyDataSource = new MyDataSource(d1)
) { }
```

**UseCases** (with a `D1Database` and Durable Object namespace):

```typescript
constructor(
    d1: D1Database,
    private readonly doNamespace: DurableObjectNamespace<EventCancellationExpirationJobDurableObject>,
    private readonly dataSource: MyDataSource = new MyDataSource(d1),
    private readonly cancelJobUseCase: DeleteEventCancellationExpirationJobUseCase = new DeleteEventCancellationExpirationJobUseCase(d1, doNamespace)
) { }
```

**Controllers** (extend `OpenAPIRoute`, receive `RouteOptions` from Chanfana):

```typescript
constructor(
    params: RouteOptions,
    private readonly mapper: MyMapper = new MyMapper()
) {
    super(params);
}
```

### Business Sub-Layers

The business layer consists of two major sub-layers:

- **Data:** lower-level data modeling specific to an API, SDK, runtime, or external vendor. Data here is not necessarily optimized for our problem set but is needed to interact with third-party tools.
- **Domain:** high-level data modeling specifically designed for our problem set. This includes API contracts since we design this interface and it is not necessarily reliant on third-party tooling.

### Models

We have two types of models in this architecture:

- **DataModel:** Lives within the Data layer to model third-party data. Located in `<feature>/data/model` where the file and class name always end in `DataModel`.
- **DomainModel:** Lives within the Domain layer to model problems solved by our first-party application. Located in `<feature>/domain/model` where the file and class name always end in `DomainModel`.

### Hierarchy

With the prior information established, here is a bottom-up view of our Business layer:

- **DataModel:** Previously described. Lowest-level component in this stack.
- **DataSource:** These classes directly integrate with an SDK and use their API-specific technology. For example, this is where we use the Drizzle ORM to query D1, or `process.env` to read an environment variable. Should we ever need to move runtimes or SDKs in the future, this is the only layer that should need to change. Located in `<feature>/data/datasource` where the file and class name always end in `DataSource`.
- **Mapper:** In cases where we need to transform data from a `DataModel` to a `DomainModel`, this is the place to do it. Located in `<feature>/data/mapper` where the file and class name always end in `Mapper`.
  - For **single-input** mappings, extend `GenericMapper<Input, Output>` from `src/shared/data/mapper/GenericMapper.ts` and implement `map(payload: Input): Output`.
  - For **multi-input** mappings (e.g., separate `name`, `reason`, `timeOfEvent` parameters), do NOT use `GenericMapper<>`. Instead, define a mapper class with an explicit `map(param1, param2, ...)` signature using named parameters.
- **Repository:** Used as the top-most component in our Data layer. Often used to fetch information from a `DataSource` and map it from a `DataModel` to a `DomainModel`. Located in `<feature>/data/repository` where the file and class name always end in `Repository`.

Now we leave the data layer and move to the domain layer:

- **DomainModel:** Previously described.
- **UseCase:** This is where core business logic lives, after all data has been retrieved and mapped. Each use case answers one high-level problem within this domain. Deleting vs. creating the same resource are separate use cases. Located in `<feature>/domain/usecase` where the file and class name always end in `UseCase`. Each UseCase exposes an `execute()` method.

### Flow

```text
DataSource → Repository (calls Mapper if DataSource returns a DataModel) → UseCase
```

### Pragmatic Guidance

In cases where having a `DataModel` would result in the exact same schema as a `DomainModel`, skip the `DataModel` and use the `DomainModel` directly. This is likely an indicator that no third-party SDKs are involved.

In cases where a `Repository` would just proxy straight to a `DataSource` without mapping, skip the `Repository`. Each class should have meaning. A valid minimal flow is:

```text
DataSource (returns a DomainModel directly) → UseCase
```

## Tech Stack

This project is rather basic in its needs.

- Runs on Node.js. We always use the latest LTS version as listed on the [official download page](https://nodejs.org/en/download).
- NPM is our package manager.
- Most `npm run` commands are wrappers on top of [Cloudflare's Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/).
- Project runs on the **Cloudflare Workers** runtime.
  - Database: [Cloudflare D1](https://developers.cloudflare.com/d1/), a SQLite runtime.
  - Scheduled jobs: [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) with the Alarm API.
- Key libraries:
  - [Hono](https://hono.dev/) — web application framework
  - [Chanfana](https://chanfana.pages.dev/) — OpenAPI schema generator and validator; built on top of Zod and generates the OpenAPI spec simultaneously with validation
  - [Drizzle ORM and Drizzle Kit](https://orm.drizzle.team/) — ORM for SQLite/D1; currently on **v1 Beta** (`1.0.0-beta.x`). The `drizzle-orm` and `drizzle-kit` packages must stay on the same beta version. The v1 Beta migration structure uses subdirectories per migration (`<timestamp>_<name>/migration.sql`) with no `journal.json`.
  - [Zod](https://zod.dev/) — schema validation. Must call `extendZodWithOpenApi(z)` in `src/index.ts` before using `.openapi()` on any Zod type.
- 100% TypeScript.
- No unit, integration, or E2E tests.

## Cloudflare Workers

Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

### Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: <https://developers.cloudflare.com/workers/observability/errors/>

### Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

#### Named Instances

Use `idFromName("some-name")` for a deterministic, stable DO instance ID. All callers using the same name are guaranteed to reach the same instance:

```typescript
const stub = namespace.get(namespace.idFromName("event-cancellation"));
```

#### Alarm API

Each DO instance supports at most **one alarm** at a time. Calling `setAlarm()` overwrites any prior alarm — there is no queue. Call `deleteAlarm()` to cancel a pending alarm.

```typescript
await this.ctx.storage.setAlarm(expirationTimeMs);
await this.ctx.storage.deleteAlarm();
```

#### Alarm Lifecycle

When `alarm()` fires, the alarm is already consumed by the CF runtime. There is no need to call `deleteAlarm()` from within `alarm()` — it would be a no-op. The only work needed inside `alarm()` is the cleanup your job was scheduled to perform (e.g., deleting DB rows).

## Docs, LLMs, and MCP

Here are all of the resources we use for documentation:

**Human-readable docs:**

- All Cloudflare: <https://developers.cloudflare.com/>
- Chanfana: <https://chanfana.pages.dev/>
- Cloudflare D1: <https://developers.cloudflare.com/d1/>
- Cloudflare Durable Objects: <https://developers.cloudflare.com/durable-objects/>
- Cloudflare Workers: <https://developers.cloudflare.com/workers/>
- Hono: <https://hono.dev/>

**LLMs.txt:**

- All Cloudflare: <https://developers.cloudflare.com/llms.txt>
- Chanfana: <https://raw.githubusercontent.com/cloudflare/chanfana/refs/heads/main/llms.txt>
- Cloudflare D1: <https://developers.cloudflare.com/d1/llms.txt>
- Cloudflare Durable Objects: <https://developers.cloudflare.com/durable-objects/llms.txt>
- Cloudflare Workers: <https://developers.cloudflare.com/workers/llms.txt>
- Hono: <https://hono.dev/llms.txt>

**MCP:**

- MCP: <https://docs.mcp.cloudflare.com/mcp>
