import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const liveEvents = sqliteTable("live_events", {
    videoId: text("video_id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    status: text("status", { enum: ["offline", "live", "prewarming", "canceled"] }).notNull(),
});
