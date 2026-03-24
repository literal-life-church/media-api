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
