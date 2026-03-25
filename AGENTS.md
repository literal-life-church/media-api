# AGENTS.md for Media API

This project is a Cloudflare Workers API for the various needs of Literal Life Church's public media presence.

It is capable of these high-level tasks:

- **Live Streaming:** receives and caches live event metadata from an internal automation engine, which is later used to embed a YouTube Live Stream player on a website. The module manages the full event lifecycle:
  - `POST /live-streaming/go-live` — publish a live event with YouTube video ID, name, and description
  - `POST /live-streaming/cancel` — mark an event as canceled with a reason, event name, and scheduled time; automatically expires after a configured duration via a Cloudflare Durable Object alarm
  - `POST /live-streaming/prewarm` — signal that a live event is being prepared
  - `DELETE /live-streaming` — take an event offline
  - `GET /live-streaming` — public read of current event state (no auth required)

Publishing, canceling, prewarming, and unpublishing require HMAC-SHA256 authentication. Reading does not.

## Commands Useful in Development

The runtime supports hot reloads, so spinning up a local dev instance is usually only necessary at the start of a session.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run db:generate` | Create a migration for schema changes |
| `npm run db:migrate` | Apply all migrations to the local database |
| `npm run db:reset` | Delete local SQLite database files and re-migrate |
| `npm run db:studio` | Start [Drizzle Studio](https://local.drizzle.studio/) to inspect the local database |
| `npm run dev:generate-signature` | Generate a request body with a `requestTime` property and a valid `Authorization` bearer token |
| `npm run dev:types` | Regenerate TypeScript types from `wrangler.jsonc` bindings |

After changing bindings in `wrangler.jsonc`, stop the running server, run `npm run dev:types`, then restart the server. The user must send an interrupt signal in their terminal to stop the server — let them know when this is needed.
