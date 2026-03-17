import { EventCancellationDurableObject } from "../../EventCancellationDurableObject";
import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class CancelEventCancellationJobUseCase {
    constructor(
        d1: D1Database,
        private readonly doNamespace: DurableObjectNamespace<EventCancellationDurableObject>,
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        const stub = this.doNamespace.get(this.doNamespace.idFromName("event-cancellation"));
        await stub.cancelExpiration();
        await this.dataSource.deletePendingEventCancellationExpirationJobs();
    }
}
