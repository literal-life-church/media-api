import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

import { activeJobs } from "../../../db/schemas/ActiveJobs";
import { EVENT_CANCELLATION_EXPIRATION_JOB_ID } from "../../config";

export class ActiveJobsDataSource {
    constructor(
        d1: D1Database,
        private readonly db: ReturnType<typeof drizzle> = drizzle(d1)
    ) { }

    async createOrUpdatePendingEventCancellationExpirationJob(): Promise<void> {
        await this.db.insert(activeJobs)
            .values({ id: EVENT_CANCELLATION_EXPIRATION_JOB_ID })
            .onConflictDoUpdate({ target: activeJobs.id, set: { id: EVENT_CANCELLATION_EXPIRATION_JOB_ID } });
    }

    async deletePendingEventCancellationExpirationJobs(): Promise<void> {
        await this.db.delete(activeJobs)
            .where(eq(activeJobs.id, EVENT_CANCELLATION_EXPIRATION_JOB_ID));
    }
}
