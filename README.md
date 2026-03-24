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
npm install
```

Create a `.dev.vars` file in the project root with your local secrets:

```
AUTHORIZATION_SIGNING_SECRET=your-local-secret-here
```

Apply database migrations and start the development server:

```bash
npm run db:migrate
npm run dev
```

The API and Swagger UI will be available at `http://localhost:8787/`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server with hot reload |
| `npm run db:generate` | Generate a new migration from schema changes |
| `npm run db:migrate` | Apply all pending migrations to the local database |
| `npm run db:reset` | Delete the local SQLite database files (prompts for confirmation) |
| `npm run db:studio` | Open Drizzle Studio to inspect the local database |
| `npm run dev:generate-signature` | Generate a valid `requestTime` and `Authorization` bearer token for testing |
| `npm run dev:types` | Regenerate TypeScript types from `wrangler.jsonc` bindings |

## API

All endpoints live under `/live-streaming`. The `Authorization` header uses a SHA-256 HMAC bearer token. Use `npm run dev:generate-signature` to generate a valid token locally.

| Method | Path | Auth Required | Purpose |
| --- | --- | --- | --- |
| `GET` | `/live-streaming` | No | Get the current live event status |
| `POST` | `/live-streaming/go-live` | Yes | Publish a live event |
| `POST` | `/live-streaming/cancel` | Yes | Mark a live event as canceled |
| `POST` | `/live-streaming/prewarm` | Yes | Set a live event to a prewarming state |
| `DELETE` | `/live-streaming` | Yes | Unpublish a live event, returning it to offline |
