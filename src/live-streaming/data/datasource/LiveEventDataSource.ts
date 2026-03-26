import { drizzle } from "drizzle-orm/d1";

import { type LiveEvent, liveEvents } from "../../../db/schemas/LiveEvents";

export class LiveEventDataSource {
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

    async deleteLiveEvent(): Promise<void> {
        await this.db.delete(liveEvents);
    }

    async getLiveEvent(): Promise<LiveEvent | null> {
        const row = await this.db.select().from(liveEvents).limit(1).get();
        return row ?? null;
    }
}
