import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

import { activeJobs } from "../../../db/schemas/ActiveJobs";

export class ActiveJobsDataSource {
    constructor(
        d1: D1Database,
        private readonly db: ReturnType<typeof drizzle> = drizzle(d1)
    ) { }

    async deletePendingEventCancellationExpirationJobs(): Promise<void> {
        await this.db.delete(activeJobs).where(eq(activeJobs.type, "event_cancellation"));
    }

    async insertPendingEventCancellationExpirationJob(id: string): Promise<void> {
        await this.db.insert(activeJobs).values({ id, type: "event_cancellation" });
    }
}
