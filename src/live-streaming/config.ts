import { LiveEventResponse } from "./domain/model/response/LiveEventStatusDomainModel";

// Durable Objects
export const EVENT_CANCELLATION_EXPIRATION_JOB_ID = "event_cancellation_expiration";
export const STREAM_HUB_CLOSING_STATUSES = new Set<LiveEventResponse["status"]>(["canceled", "offline"]);
export const STREAM_HUB_EVENT_NAME = "event.state_transition";
export const STREAM_HUB_ID = "stream_hub";
export const STREAM_HUB_PING_INTERVAL_MS = 30_000;

// OpenAPI
export const OPENAPI_TAGS = ["Live Streaming"];
