import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { EventCancellationExpirationJobDurableObject } from "../../EventCancellationExpirationJobDurableObject";
import { EVENT_CANCELLATION_EXPIRATION_JOB_ID } from "../../config";

export class ScheduleEventCancellationExpirationJobUseCase {
    constructor(
        d1: D1Database,
        private readonly activeJobsDataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1),
        private readonly eventCancellationExpirationJob: DurableObjectNamespace<EventCancellationExpirationJobDurableObject>
    ) { }

    async execute(expirationTime: number): Promise<void> {
        const objectId = this.eventCancellationExpirationJob.idFromName(EVENT_CANCELLATION_EXPIRATION_JOB_ID);
        const stub = this.eventCancellationExpirationJob.get(objectId);

        await stub.scheduleExpiration(expirationTime);
        await this.activeJobsDataSource.createOrUpdatePendingEventCancellationExpirationJob();
    }
}
