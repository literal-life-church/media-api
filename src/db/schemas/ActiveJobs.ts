import { sqliteTable, text } from "drizzle-orm/sqlite-core";

import { EVENT_CANCELLATION_JOB_TYPE } from "../../live-streaming/config";

export const activeJobs = sqliteTable("active_jobs", {
    id: text("id").primaryKey(),
    type: text("type", { enum: [EVENT_CANCELLATION_JOB_TYPE] }).notNull(),
});

export type ActiveJob = typeof activeJobs.$inferSelect;
