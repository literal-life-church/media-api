# Tech Stack

This project is rather basic in its needs.

- Runs on NodeJS. We always use the latest LTS version of NodeJS as it is listed on their [official download page](https://nodejs.org/en/download).
- NPM is our package manager
- Most of the `npm run` commands you encounter are just wrappers on top of [Cloudflare's Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- Project runs on Cloudflare Workers runtime
  - Our database runs on [Cloudflare D1](https://developers.cloudflare.com/d1/), which is a SQLite runtime
- Some of our most essential libraries:
  - [Hono](https://hono.dev/) as the Web Application Framework
  - [Chanfana](https://chanfana.pages.dev/) as the OpenAPI schema generator and validator
  - [Drizzle ORM and Drizzle Kit](https://orm.drizzle.team/) as the ORM to our SQLite database
  - [Zod](https://zod.dev/) as the schema validator. Chanfana's built-in validator is built of top of Zod and also adds in support for simultaneously creating the OpenAPI schema at the same time as validating it.
- 100% of this project is written TypeScript
- There aren't any unit, integration, or E2E tests
