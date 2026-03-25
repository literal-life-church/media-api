# Media API

General-purpose API layer for exposing public information for Literal Life Church's live streams and archived sermons.

## Prerequisites

- [Node.js LTS](https://nodejs.org/en/download)
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (installed automatically via `npm install`)

## Local Setup

```bash
git clone git@github.com:literal-life-church/media-api.git
cd media-api

npm i
cp .env.example .env.local # Fill in your local secrets

npm run db:migrate # Create DB and apply migrations
npm run dev # Start the dev server
```

The API will be available at `http://localhost:8787/`. Interactive docs are at `/try` (Swagger UI) and `/docs` (ReDoc).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server with hot reload |
| `npm run db:generate` | Generate a new migration from schema changes |
| `npm run db:migrate` | Apply all pending migrations to the local database |
| `npm run db:reset` | Delete the local SQLite database files (prompts for confirmation) |
| `npm run db:studio` | Open [Drizzle Studio](https://local.drizzle.studio/) to inspect the local database |
| `npm run dev:generate-signature` | Generate a valid `requestTime` and `Authorization` bearer token for testing |
| `npm run dev:types` | Regenerate TypeScript types from `wrangler.jsonc` bindings |

## API

See [`src/live-streaming/README.md`](src/live-streaming/README.md) for the full endpoint reference. The `Authorization` header uses a SHA-256 HMAC bearer token. Use `npm run dev:generate-signature` to generate a valid token locally.
