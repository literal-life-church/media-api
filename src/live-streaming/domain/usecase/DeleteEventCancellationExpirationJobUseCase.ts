import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { EVENT_CANCELLATION_EXPIRATION_JOB_ID } from "../../config";
import { EventCancellationDurableObject } from "../../EventCancellationDurableObject";

export class DeleteEventCancellationExpirationJobUseCase {
    constructor(
        d1: D1Database,
        private readonly doNamespace: DurableObjectNamespace<EventCancellationDurableObject>,
        private readonly dataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        const objectId = this.doNamespace.idFromName(EVENT_CANCELLATION_EXPIRATION_JOB_ID);
        const stub = this.doNamespace.get(objectId);

        await stub.cancelExpiration();
        await this.dataSource.deletePendingEventCancellationExpirationJobs();
    }
}
