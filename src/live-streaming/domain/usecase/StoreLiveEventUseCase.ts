import { CancelEventCancellationJobUseCase } from "./CancelEventCancellationJobUseCase";
import { EventCancellationDurableObject } from "../../EventCancellationDurableObject";
import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class StoreLiveEventUseCase {
    constructor(
        d1: D1Database,
        doNamespace: DurableObjectNamespace<EventCancellationDurableObject>,
        private readonly cancelJobUseCase: CancelEventCancellationJobUseCase = new CancelEventCancellationJobUseCase(d1, doNamespace),
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1)
    ) { }

    async execute(videoId: string, name: string, description: string): Promise<void> {
        await this.cancelJobUseCase.execute();
        await this.dataSource.createOrUpdateLiveEvent(videoId, name, description);
    }
}
