import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

import { activeJobs } from "../../../db/schemas/ActiveJobs";
import { EVENT_CANCELLATION_EXPIRATION_JOB_ID } from "../../config";

export class ActiveJobsDataSource {
    constructor(
        d1: D1Database,
        private readonly db: ReturnType<typeof drizzle> = drizzle(d1)
    ) { }

    async deletePendingEventCancellationExpirationJobs(): Promise<void> {
        await this.db.delete(activeJobs).where(eq(activeJobs.id, EVENT_CANCELLATION_EXPIRATION_JOB_ID));
    }

    async insertPendingEventCancellationExpirationJob(): Promise<void> {
        await this.db.insert(activeJobs)
            .values({ id: EVENT_CANCELLATION_EXPIRATION_JOB_ID })
            .onConflictDoNothing();
    }
}
