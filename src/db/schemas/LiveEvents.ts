import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const liveEvents = sqliteTable("live_events", {
    id: integer("id").primaryKey().default(1),
    videoId: text("video_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    status: text("status", { enum: ["offline", "live", "prewarming", "canceled"] }).notNull(),
});
