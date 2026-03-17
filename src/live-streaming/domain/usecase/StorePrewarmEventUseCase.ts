import { CancelEventCancellationJobUseCase } from "./CancelEventCancellationJobUseCase";
import { EventCancellationDurableObject } from "../../EventCancellationDurableObject";
import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class StorePrewarmEventUseCase {
    constructor(
        d1: D1Database,
        doNamespace: DurableObjectNamespace<EventCancellationDurableObject>,
        private readonly cancelJobUseCase: CancelEventCancellationJobUseCase = new CancelEventCancellationJobUseCase(d1, doNamespace),
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        await this.cancelJobUseCase.execute();
        await this.dataSource.createOrUpdatePrewarmEvent();
    }
}
