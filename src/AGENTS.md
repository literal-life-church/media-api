# Tech Stack

This project runs on Cloudflare Workers. Here is what you need to know about Cloudflare Workers:

@../agent-docs/cloudflare-workers.md

Additionally, here is this project's tech stack details:

@../agent-docs/tech-stack.md

## Architecture

Here is what you need to know about our architecture and how our project is structured:

@../agent-docs/architecture.md

## Source Modules

The `src/` directory contains two feature modules:

- **`live-streaming/`** — manages all live event state transitions (publish, cancel, prewarm, unpublish, read). See `src/live-streaming/AGENTS.md` for domain-specific guidance.
- **`shared/`** — cross-cutting concerns used by all feature modules: auth middleware, error hierarchy, environment config, and shared mappers. See `src/shared/AGENTS.md` for guidance.

The entry point is `src/index.ts`, which registers all routes, applies auth middleware, and exports the Durable Object class required by the Cloudflare runtime.

## Constructor Injection

All dependencies use constructor injection with default parameter values. This makes every class independently testable without a DI framework.

**Use cases** (receive `D1Database`):

```typescript
constructor(
    d1: D1Database,
    private readonly dataSource: MyDataSource = new MyDataSource(d1)
) { }
```

**Use cases with DO namespace:**

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

## LLMs

- Chanfana: <https://chanfana.pages.dev/llms.txt>
- Hono: <https://hono.dev/llms.txt>
