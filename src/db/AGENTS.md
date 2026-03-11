# Database Documentation

Our database engine runs on [Cloudflare D1](https://developers.cloudflare.com/d1/), which is powered by SQLite. We use [Drizzle ORM](https://orm.drizzle.team/) for all interactions with the database.

Drizzle has first-class support for [Cloudflare D1](https://orm.drizzle.team/docs/get-started/d1-new).

## Drizzle's Responsibilities

Here is what Drizzle is responsible for:

- **Schema creation:** All schema definitions are located under `src/db/schemas`. There is 1 table per TypeScript file. These are note SQL files, but are used by the Drizzle ORM. The file is named in PascalCase based on the table_name. The table_name is lower snake case. All information about that table, such as the declaration, constraints, etc. Go into these files.
- **Migration file generation:** All migration scripts are located under `drizzle`. Each migration operation has a folder with a timestamp and a snake_case title briefly showing what changed. These migrations are manged by `drizzle-kit` and can be created with something like this: `npx drizzle-kit generate --name=create_live_events`. All of the files in here are managed by Drizzle and consist of SQL files and JSON snapshot data.
- **Migration application:** Drizzle also handles this. It can be accomplished by running `npx drizzle-kit migrate` or `npm run db:migrate`.

## Workflow

All development is handled by the Cloudflare Workers SDK. That is to say, local development uses a local database, never a remote one.

## LLMs

Here are some useful resources regarding our database and ORM library:

- Cloudflare LLMs: https://developers.cloudflare.com/llms.txt
- Cloudflare D1 LLMs: https://developers.cloudflare.com/d1/llms.txt
- Drizzle: https://orm.drizzle.team/llms.txt
