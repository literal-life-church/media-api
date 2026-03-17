import { drizzle } from "drizzle-orm/d1";
import { DurableObject } from "cloudflare:workers";
import { eq } from "drizzle-orm";

import { activeJobs } from "../db/schemas/ActiveJobs";
import { EVENT_CANCELLATION_EXPIRATION_JOB_ID } from "./config";
import { liveEvents } from "../db/schemas/LiveEvents";

export class EventCancellationExpirationJobDurableObject extends DurableObject<Env> {
    async alarm(): Promise<void> {
        const db = drizzle(this.env.DB);
        await db.delete(liveEvents);
        await db.delete(activeJobs).where(eq(activeJobs.id, EVENT_CANCELLATION_EXPIRATION_JOB_ID));
    }

    async cancelExpiration(): Promise<void> {
        await this.ctx.storage.deleteAlarm();
    }

    async scheduleExpiration(expirationTime: number): Promise<void> {
        await this.ctx.storage.setAlarm(expirationTime);
    }
}
