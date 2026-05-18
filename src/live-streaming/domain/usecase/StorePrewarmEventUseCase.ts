import { BroadcastStateTransitionUseCase } from "./BroadcastStateTransitionUseCase";
import { DeleteEventCancellationExpirationJobUseCase } from "./DeleteEventCancellationExpirationJobUseCase";
import { EventCancellationExpirationJobDurableObject } from "../../EventCancellationExpirationJobDurableObject";
import { LiveEventDataSource } from "../../data/datasource/LiveEventDataSource";
import { StreamHubDurableObject } from "../../StreamHubDurableObject";

export class StorePrewarmEventUseCase {
    constructor(
        d1: D1Database,
        eventCancellationExpirationJob: DurableObjectNamespace<EventCancellationExpirationJobDurableObject>,
        streamHub: DurableObjectNamespace<StreamHubDurableObject>,
        private readonly broadcastUseCase: BroadcastStateTransitionUseCase = new BroadcastStateTransitionUseCase(d1, streamHub),
        private readonly cancelJobUseCase: DeleteEventCancellationExpirationJobUseCase = new DeleteEventCancellationExpirationJobUseCase(d1, eventCancellationExpirationJob),
        private readonly liveEventDataSource: LiveEventDataSource = new LiveEventDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        await this.cancelJobUseCase.execute();
        await this.liveEventDataSource.createOrUpdatePrewarmEvent();
        await this.broadcastUseCase.execute();
    }
}
