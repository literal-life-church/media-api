import { LiveEventResponse } from "./domain/model/response/LiveEventStatusDomainModel";
import { EnvironmentVariableDataSource } from "../shared/data/datasource/EnvironmentVariableDataSource";

// Durable Objects
export const EVENT_CANCELLATION_EXPIRATION_JOB_ID = "event_cancellation_expiration";
export const STREAM_HUB_CLOSING_STATUSES = new Set<LiveEventResponse["status"]>(["canceled", "offline"]);
export const STREAM_HUB_EVENT_NAME = "event.state_transition";
export const STREAM_HUB_ID = "stream_hub";
export const STREAM_HUB_PING_INTERVAL_MS = 30_000;

// OpenAPI
export const OPENAPI_TAGS = ["Live Streaming"];

// Push Notifications: Go Live
export const GO_LIVE_HEADING = "Now Live";
export const GO_LIVE_NOTIFICATION_NAME = "go_live";
export const GO_LIVE_SEGMENT = "go_live";
export const GO_LIVE_TTL = 10_800;
export const GO_LIVE_URL = EnvironmentVariableDataSource("GO_LIVE_PUSH_NOTIFICATION_URL") || "";
export const GO_LIVE_WEB_PUSH_TOPIC = "literal_life_church_live_event_go_live";
