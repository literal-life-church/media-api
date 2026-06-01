import { LiveEventResponse } from "./domain/model/response/LiveEventStatusDomainModel";
import { EnvironmentVariableDataSource } from "../shared/data/datasource/EnvironmentVariableDataSource";

// Durable Objects
export const EVENT_CANCELLATION_EXPIRATION_JOB_ID = "event_cancellation_expiration";

export const STREAM_HUB_BROADCAST_TIMEOUT_MS = 200;
export const STREAM_HUB_CLOSE_CONNECTION_EVENT_NAME = "event.close_connection";
export const STREAM_HUB_CLOSING_STATUSES = new Set<LiveEventResponse["status"]>(["canceled", "offline"]);
export const STREAM_HUB_ID = "stream_hub";
export const STREAM_HUB_PING_INTERVAL_MS = 30_000;
export const STREAM_HUB_PING_TIMEOUT_MS = 5_000;
export const STREAM_HUB_STATE_TRANSITION_EVENT_NAME = "event.state_transition";

// OpenAPI
export const OPENAPI_TAGS = ["Live Streaming"];

// Push Notifications: Event Cancellation
export const CANCELLATION_NOTIFICATION_CLICK_URL = EnvironmentVariableDataSource("CANCELLATION_PUSH_NOTIFICATION_URL") || "";
export const CANCELLATION_NOTIFICATION_GROUP_ID = "literal_life_church_live_event_schedule_updates";
export const CANCELLATION_NOTIFICATION_NAME = "schedule_updates";
export const CANCELLATION_SEGMENT = "schedule_updates";
export const CANCELLATION_TIMEZONE = EnvironmentVariableDataSource("TZ") || "America/New_York";
export const CANCELLATION_TTL = 10_800;

// Push Notifications: Go Live
export const GO_LIVE_NOTIFICATION_CLICK_URL = EnvironmentVariableDataSource("GO_LIVE_PUSH_NOTIFICATION_URL") || "";
export const GO_LIVE_NOTIFICATION_GROUP_ID = "literal_life_church_live_event_go_live";
export const GO_LIVE_NOTIFICATION_NAME = "go_live";
export const GO_LIVE_SEGMENT = "go_live";
export const GO_LIVE_TITLE = "Now Live";
export const GO_LIVE_TTL = 10_800;
