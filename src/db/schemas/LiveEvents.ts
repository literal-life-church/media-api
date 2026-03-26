import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const liveEvents = sqliteTable("live_events", {
    id: integer("id").primaryKey().default(1),
    videoId: text("video_id").notNull().default(""),
    name: text("name").notNull().default(""),
    description: text("description").notNull().default(""),
    cancellationReason: text("cancellation_reason").notNull().default(""),
    timeOfEvent: text("time_of_event").notNull().default(""),
    status: text("status", { enum: ["offline", "live", "prewarming", "canceled"] }).notNull(),
});

export type LiveEvent = typeof liveEvents.$inferSelect;
