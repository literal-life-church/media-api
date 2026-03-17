import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { EventCancellationDurableObject } from "../../EventCancellationDurableObject";

export class CancelEventCancellationJobUseCase {
    constructor(
        d1: D1Database,
        private readonly doNamespace: DurableObjectNamespace<EventCancellationDurableObject>,
        private readonly dataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        const stub = this.doNamespace.get(this.doNamespace.idFromName("event-cancellation"));
        await stub.cancelExpiration();
        await this.dataSource.deletePendingEventCancellationExpirationJobs();
    }
}
