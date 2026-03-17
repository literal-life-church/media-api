import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const activeJobs = sqliteTable("active_jobs", {
    id: text("id").primaryKey(),
});

export type ActiveJob = typeof activeJobs.$inferSelect;
