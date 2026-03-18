import { DurableObject } from "cloudflare:workers";

import { DeleteAllEventCacheUseCase } from "./domain/usecase/DeleteAllEventCacheUseCase";

export class EventCancellationExpirationJobDurableObject extends DurableObject<Env> {
    constructor(
        ctx: DurableObjectState,
        env: Env,
        private readonly deleteAllEventCacheUseCase: DeleteAllEventCacheUseCase = new DeleteAllEventCacheUseCase(env.DB)
    ) {
        super(ctx, env);
    }

    async alarm(): Promise<void> {
        await this.deleteAllEventCacheUseCase.execute();
        console.info(`Executed event cancellation expiration job at ${new Date().toISOString()}. Cleared all cancellation messages and pending jobs.`);
    }

    async cancelExpiration(): Promise<void> {
        await this.ctx.storage.deleteAlarm();
    }

    async scheduleExpiration(expirationTime: number): Promise<void> {
        await this.ctx.storage.setAlarm(expirationTime);
    }
}
