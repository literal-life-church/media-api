# AGENTS.md for Media API

This project is a simple API for the various needs of Literal Life Church's public media presence.

Thus far, it is capable of these high-level tasks

- Live Streaming: receives and caches metadata from an internal automation engine that is later to used to embed a YouTube Live Stream player onto a website. Publishing this metadata requires authentication. Reading it does not. The metadata is simple. It include the embed link, video title, and description.

## Commands Useful in Development

Keep in mind that this runtime supports hot reloads. So, spinning up a local dev instance is often only necessary at the start of a development session.

| Command | Purpose |
| --------- | --------- |
| `npm run dev` | Local development |
| `npm run db:generate` | Creates migrations for changes to the database schema` |
| `npm run db:migrate` | Runs all migrations on a given DB instance |
| `npm run db:studio` | Starts up a local instance of the Drizzle Studio to preview your database |
| `npm run dev:generate-signature` | Create a request body with a `requestTime` property at the root and a valid authorization `Bearer` token |
| `npm run dev:types` | Regenerate TypeScript types |

Run `npm run types` after changing bindings in `wrangler.jsonc`. This will require you to stop the running server. However, the only way to do that is for the developer to send an interrupt signal in their terminal. So, just let the developer know when you need them to stop the project and run it again.
