import { drizzle } from "drizzle-orm/d1";

import { liveEvents } from "../../../db/schemas/LiveEvents";

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

    async deleteLiveEvent(): Promise<void> {
        await this.db.delete(liveEvents);
    }
}
