import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { EventCancellationExpirationJobDurableObject } from "../../EventCancellationExpirationJobDurableObject";
import { EVENT_CANCELLATION_EXPIRATION_JOB_ID } from "../../config";

export class DeleteEventCancellationExpirationJobUseCase {
    constructor(
        d1: D1Database,
        private readonly eventCancellationExpirationJob: DurableObjectNamespace<EventCancellationExpirationJobDurableObject>,
        private readonly activeJobsDataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        const objectId = this.eventCancellationExpirationJob.idFromName(EVENT_CANCELLATION_EXPIRATION_JOB_ID);
        const stub = this.eventCancellationExpirationJob.get(objectId);

        await stub.cancelExpiration();
        await this.activeJobsDataSource.deletePendingEventCancellationExpirationJobs();
        console.info("Deleted pending event cancellation expiration job");
    }
}
