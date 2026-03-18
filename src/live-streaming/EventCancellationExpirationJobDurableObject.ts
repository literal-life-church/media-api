import { DurableObject } from "cloudflare:workers";

import { ActiveJobsDataSource } from "./data/datasource/ActiveJobsDataSource";
import { LiveEventDataSource } from "./data/datasource/LiveEventDataSource";

export class EventCancellationExpirationJobDurableObject extends DurableObject<Env> {
    constructor(
        ctx: DurableObjectState,
        env: Env,
        private readonly activeJobsDataSource: ActiveJobsDataSource = new ActiveJobsDataSource(env.DB),
        private readonly liveEventDataSource: LiveEventDataSource = new LiveEventDataSource(env.DB)
    ) {
        super(ctx, env);
    }

    async alarm(): Promise<void> {
        await this.activeJobsDataSource.deletePendingEventCancellationExpirationJobs();
        await this.liveEventDataSource.deleteLiveEvent();
    }

    async cancelExpiration(): Promise<void> {
        await this.ctx.storage.deleteAlarm();
    }

    async scheduleExpiration(expirationTime: number): Promise<void> {
        await this.ctx.storage.setAlarm(expirationTime);
    }
}
