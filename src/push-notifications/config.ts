import { EnvironmentVariableDataSource } from "../shared/data/datasource/EnvironmentVariableDataSource";

export const PUSH_API_KEY = EnvironmentVariableDataSource("PUSH_API_KEY") || "";
export const PUSH_API_URL = "https://api.onesignal.com/notifications";
export const PUSH_APP_ID = EnvironmentVariableDataSource("PUSH_APP_ID") || "";
export const PUSH_BADGE_URL = EnvironmentVariableDataSource("PUSH_BADGE_URL") || "";
export const PUSH_ICON_URL = EnvironmentVariableDataSource("PUSH_ICON_URL") || "";
export const PUSH_TARGET_CHANNEL = "push";
