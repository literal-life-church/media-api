import { drizzle } from "drizzle-orm/d1";

import { liveEvents } from "../../../db/schemas/LiveEvents";

export class PersistentDataSource {
    constructor(
        d1: D1Database,
        private readonly db: ReturnType<typeof drizzle> = drizzle(d1)
    ) { }

    async createOrUpdateLiveEvent(
        videoId: string,
        name: string,
        description: string,
        status: "canceled" | "live" | "offline" | "prewarming"
    ): Promise<void> {
        await this.db
            .insert(liveEvents)
            .values({ id: 1, videoId, name, description, status })
            .onConflictDoUpdate({
                target: liveEvents.id,
                set: { videoId, name, description, status },
            });
    }
}
