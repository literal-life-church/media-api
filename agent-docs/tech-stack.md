# Tech Stack

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
