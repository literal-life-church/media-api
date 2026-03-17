import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { EventCancellationExpirationJobDurableObject } from "../../EventCancellationExpirationJobDurableObject";
import { EVENT_CANCELLATION_EXPIRATION_JOB_ID } from "../../config";

export class ScheduleEventCancellationExpirationJobUseCase {
    constructor(
        d1: D1Database,
        private readonly doNamespace: DurableObjectNamespace<EventCancellationExpirationJobDurableObject>,
        private readonly dataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1)
    ) { }

    async execute(expirationTime: number): Promise<void> {
        const objectId = this.doNamespace.idFromName(EVENT_CANCELLATION_EXPIRATION_JOB_ID);
        const stub = this.doNamespace.get(objectId);

        await stub.scheduleExpiration(expirationTime);
        await this.dataSource.createOrUpdatePendingEventCancellationExpirationJob();
    }
}
