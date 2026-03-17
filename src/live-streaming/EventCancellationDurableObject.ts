import { drizzle } from "drizzle-orm/d1";
import { DurableObject } from "cloudflare:workers";
import { eq } from "drizzle-orm";

import { activeJobs } from "../db/schemas/ActiveJobs";
import { liveEvents } from "../db/schemas/LiveEvents";

// TODO move this to a data source
export class EventCancellationDurableObject extends DurableObject<Env> {
    async alarm(): Promise<void> {
        const db = drizzle(this.env.DB);
        await db.delete(liveEvents);
        await db.delete(activeJobs).where(eq(activeJobs.type, "event_cancellation"));
    }

    async cancelExpiration(): Promise<void> {
        await this.ctx.storage.deleteAlarm();
    }

    async scheduleExpiration(expirationTime: number): Promise<void> {
        await this.ctx.storage.setAlarm(expirationTime);
    }
}
