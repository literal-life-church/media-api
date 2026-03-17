import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { EVENT_CANCELLATION_JOB_NAME } from "../../config";
import { EventCancellationDurableObject } from "../../EventCancellationDurableObject";

export class DeleteEventCancellationExpirationJobUseCase {
    constructor(
        d1: D1Database,
        private readonly doNamespace: DurableObjectNamespace<EventCancellationDurableObject>,
        private readonly dataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        const id = this.doNamespace.idFromName(EVENT_CANCELLATION_JOB_NAME);
        const stub = this.doNamespace.get(id);

        await stub.cancelExpiration();
        await this.dataSource.deletePendingEventCancellationExpirationJobs();
    }
}
