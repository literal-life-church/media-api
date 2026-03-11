import { EnvironmentVariableDataSource } from "../shared/data/datasource/EnvironmentVariableDataSource";

export const CLOUDFLARE_ACCOUNT_ID = EnvironmentVariableDataSource("CLOUDFLARE_ACCOUNT_ID") || "";
export const CLOUDFLARE_D1_TOKEN = EnvironmentVariableDataSource("CLOUDFLARE_D1_TOKEN") || "";
export const CLOUDFLARE_DATABASE_ID = EnvironmentVariableDataSource("CLOUDFLARE_DATABASE_ID") || ""; // Matches the name configured in wrangler.jsonc

export const DB_NAME = "media-api"; // Matches the name configured in wrangler.jsonc
