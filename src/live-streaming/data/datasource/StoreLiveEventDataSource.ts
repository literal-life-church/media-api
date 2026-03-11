import { drizzle } from "drizzle-orm/d1";

import { liveEvents } from "../../../db/schemas/LiveEvents";

export class StoreLiveEventDataSource {
    private readonly db;

    constructor(d1: D1Database) {
        this.db = drizzle(d1);
    }

    async createOrUpdateLiveEvent(
        videoId: string,
        name: string,
        description: string,
        status: "canceled" | "live" | "offline" | "prewarming"
    ): Promise<void> {
        await this.db
            .insert(liveEvents)
            .values({ videoId, name, description, status })
            .onConflictDoUpdate({
                target: liveEvents.videoId,
                set: { name, description, status },
            });
    }
}
