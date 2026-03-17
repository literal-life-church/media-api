import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

import { activeJobs } from "../../../db/schemas/ActiveJobs";
import { EVENT_CANCELLATION_JOB_ID, EVENT_CANCELLATION_JOB_TYPE } from "../../config";

export class ActiveJobsDataSource {
    constructor(
        d1: D1Database,
        private readonly db: ReturnType<typeof drizzle> = drizzle(d1)
    ) { }

    async deletePendingEventCancellationExpirationJobs(): Promise<void> {
        await this.db.delete(activeJobs).where(eq(activeJobs.type, EVENT_CANCELLATION_JOB_TYPE));
    }

    async insertPendingEventCancellationExpirationJob(): Promise<void> {
        await this.db.insert(activeJobs)
            .values({ id: EVENT_CANCELLATION_JOB_ID, type: EVENT_CANCELLATION_JOB_TYPE })
            .onConflictDoNothing();
    }
}
