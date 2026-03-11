import { defineConfig } from "drizzle-kit";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_TOKEN, CLOUDFLARE_DATABASE_ID, DB_NAME } from "./src/db/config";
import { IS_DEV } from "./src/shared/config";

/**
 * See: https://gist.github.com/ixahmedxi/9ad9f19c04c9ed85c7a5a29521099956
 *
 * Workaround to make drizzle-kit work with local Cloudflare D1 databases.
 *
 * Since drizzle-kit doesn't natively understand D1's local development setup,
 * this function finds or creates the local SQLite file that Wrangler manages.
 *
 * Enables: drizzle-kit studio, push, generate, migrate commands locally.
 */
function getLocalD1DB() {
    try {
        const basePath = path.resolve(".wrangler/state/v3/d1");
        let dbFile = null;

        if (fs.existsSync(basePath)) {
            dbFile = fs
                .readdirSync(basePath, { encoding: "utf-8", recursive: true })
                .find((f) => f.endsWith(".sqlite"));
        }

        if (!dbFile) {
            console.log("Creating local D1 database...");
            execSync(`npx wrangler d1 execute ${DB_NAME} --local --command="select 1"`, {
                stdio: "inherit",
            });

            dbFile = fs
                .readdirSync(basePath, { encoding: "utf-8", recursive: true })
                .find((f) => f.endsWith(".sqlite"));

            if (!dbFile) {
                throw new Error("Failed to create local D1 database");
            }
        }

        return path.resolve(basePath, dbFile);
    } catch (err) {
        console.error(err);
        return null;
    }
}

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schemas/*.ts",
    dialect: "sqlite",
    ...(IS_DEV
        ? {
            dbCredentials: {
                url: getLocalD1DB(),
            },
        } : {
            driver: "d1-http",
            dbCredentials: {
                accountId: CLOUDFLARE_ACCOUNT_ID,
                databaseId: CLOUDFLARE_DATABASE_ID,
                token: CLOUDFLARE_D1_TOKEN,
            },
        }),
});
