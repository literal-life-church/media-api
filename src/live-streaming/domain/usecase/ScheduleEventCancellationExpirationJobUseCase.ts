import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { EVENT_CANCELLATION_EXPIRATION_JOB_ID } from "../../config";
import { EventCancellationDurableObject } from "../../EventCancellationDurableObject";

export class ScheduleEventCancellationExpirationJobUseCase {
    constructor(
        d1: D1Database,
        private readonly doNamespace: DurableObjectNamespace<EventCancellationDurableObject>,
        private readonly dataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1)
    ) { }

    async execute(expirationTime: number): Promise<void> {
        const stub = this.doNamespace.get(this.doNamespace.idFromName(EVENT_CANCELLATION_EXPIRATION_JOB_ID));
        await stub.scheduleExpiration(expirationTime);
        await this.dataSource.insertPendingEventCancellationExpirationJob();
    }
}
