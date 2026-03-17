import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";

import { activeJobs } from "../../../db/schemas/ActiveJobs";
import { type LiveEvent, liveEvents } from "../../../db/schemas/LiveEvents";

export class PersistentDataSource {
    constructor(
        d1: D1Database,
        private readonly db: ReturnType<typeof drizzle> = drizzle(d1)
    ) { }

    async createOrUpdateCancellation(
        name: string,
        cancellationReason: string,
        timeOfEvent: string,
    ): Promise<void> {
        await this.db
            .insert(liveEvents)
            .values({ id: 1, name, cancellationReason, timeOfEvent, status: "canceled", videoId: "", description: "" })
            .onConflictDoUpdate({
                target: liveEvents.id,
                set: { name, cancellationReason, timeOfEvent, status: "canceled", videoId: "", description: "" },
            });
    }

    async createOrUpdateLiveEvent(
        videoId: string,
        name: string,
        description: string,
    ): Promise<void> {
        await this.db
            .insert(liveEvents)
            .values({ id: 1, videoId, name, description, status: "live", cancellationReason: "", timeOfEvent: "" })
            .onConflictDoUpdate({
                target: liveEvents.id,
                set: { videoId, name, description, status: "live", cancellationReason: "", timeOfEvent: "" },
            });
    }

    async createOrUpdatePrewarmEvent(): Promise<void> {
        await this.db
            .insert(liveEvents)
            .values({ id: 1, status: "prewarming", videoId: "", name: "", description: "", cancellationReason: "", timeOfEvent: "" })
            .onConflictDoUpdate({
                target: liveEvents.id,
                set: { status: "prewarming", videoId: "", name: "", description: "", cancellationReason: "", timeOfEvent: "" },
            });
    }

    async getLiveEvent(): Promise<LiveEvent | null> {
        const row = await this.db.select().from(liveEvents).limit(1).get();
        return row ?? null;
    }

    async deleteLiveEvent(): Promise<void> {
        await this.db.delete(liveEvents);
    }

    // TODO move job management to its own data source
    async insertPendingEventCancellationExpirationJob(id: string): Promise<void> {
        await this.db.insert(activeJobs).values({ id, type: "event_cancellation" });
    }

    async deletePendingEventCancellationExpirationJobs(): Promise<void> {
        await this.db.delete(activeJobs).where(eq(activeJobs.type, "event_cancellation"));
    }
}
