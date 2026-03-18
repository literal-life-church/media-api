import { DeleteEventCancellationExpirationJobUseCase } from "./DeleteEventCancellationExpirationJobUseCase";
import { EventCancellationExpirationJobDurableObject } from "../../EventCancellationExpirationJobDurableObject";
import { LiveEventDataSource } from "../../data/datasource/LiveEventDataSource";

export class DeleteLiveEventUseCase {
    constructor(
        d1: D1Database,
        doNamespace: DurableObjectNamespace<EventCancellationExpirationJobDurableObject>,
        private readonly cancelJobUseCase: DeleteEventCancellationExpirationJobUseCase = new DeleteEventCancellationExpirationJobUseCase(d1, doNamespace),
        private readonly dataSource: LiveEventDataSource = new LiveEventDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        await this.cancelJobUseCase.execute();
        await this.dataSource.deleteLiveEvent();
    }
}
