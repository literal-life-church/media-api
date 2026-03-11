import { EnvironmentVariableDataSource } from "./data/datasource/EnvironmentVariableDataSource";

// Authorization
export const AUTHORIZATION_SIGNING_SECRET = EnvironmentVariableDataSource("AUTHORIZATION_SIGNING_SECRET") || "abc-123";

export const AUTHORIZATION_HEADER = "authorization";                            // Must be in lowercase since Hono returns the header map in lowercase
export const AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD = "requestTime";          // The field name in the payload that contains the timestamp. This is used to prevent replay attacks.
export const AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_NODE_CRYPTO = "sha256";  // Used by createHmac() from node:crypto. Algorithms must match.
export const AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_WEB_CRYPTO = "SHA-256";  // Used by crypto.subtle.digest() from Web Crypto API. Algorithms must match.
export const AUTHORIZATION_REQUEST_SIGNATURE_ENCODING = "base64";
export const AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS = 1 * 60 * 1000;         // 1 minute in the future
export const AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS = 1 * 60 * 1000;         // 1 minute in the past

// Logging
export const ENVIRONMENT_TYPE = EnvironmentVariableDataSource("NODE_ENV") || "development";

export const IS_DEV = ENVIRONMENT_TYPE.toLocaleLowerCase().trim() === "development";
export const IS_PROD = ENVIRONMENT_TYPE.toLocaleLowerCase().trim() === "production";
