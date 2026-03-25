# Database Documentation

Our database engine runs on [Cloudflare D1](https://developers.cloudflare.com/d1/), which is powered by SQLite. We use [Drizzle ORM](https://orm.drizzle.team/) for all interactions with the database.

Drizzle has first-class support for [Cloudflare D1](https://orm.drizzle.team/docs/get-started/d1-new).

## Tables

### `live_events`

Defined in `src/db/schemas/LiveEvents.ts`. Holds a single row (id is always `1`) representing the current live event state. All writes use an upsert pattern (`INSERT ... ON CONFLICT DO UPDATE`) to maintain the single-row invariant.

Fields: `id`, `videoId`, `name`, `description`, `cancellationReason`, `timeOfEvent`, `status` (enum: `offline`, `live`, `prewarming`, `canceled`).

### `active_jobs`

Defined in `src/db/schemas/ActiveJobs.ts`. Tracks active Durable Object alarm jobs. A row's presence indicates a pending job; its absence means no job is scheduled.

The only job in use is the cancellation expiration job, stored with `id = EVENT_CANCELLATION_EXPIRATION_JOB_ID` (from `src/live-streaming/config.ts`). Never hardcode this string — always import the constant.

## Drizzle's Responsibilities

- **Schema creation:** All schema definitions are in `src/db/schemas/`. One file per table, PascalCase filename matching the table concept (e.g., `LiveEvents.ts` for `live_events`). All constraints and type definitions go here.
- **Migration generation:** Run `npm run db:generate -- --name=<snake_case_description>` to create a new migration. Output goes in `drizzle/<timestamp>_<name>/migration.sql`. These files are managed by Drizzle — do not edit them manually.
- **Migration application:** Run `npm run db:migrate` to apply pending migrations.

### Drizzle v1 Beta Note

This project uses Drizzle v1 Beta (`1.0.0-beta.x`). The migration structure differs from stable releases: each migration is a subdirectory containing `migration.sql` — there is no `journal.json`. The `drizzle-orm` and `drizzle-kit` packages must always stay on the same beta version.

## Workflow

All development uses the Cloudflare Workers SDK with a local SQLite database — never a remote one.
