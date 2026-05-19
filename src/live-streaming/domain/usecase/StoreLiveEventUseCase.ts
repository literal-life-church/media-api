import { BroadcastStateTransitionUseCase } from "./BroadcastStateTransitionUseCase";
import { DeleteEventCancellationExpirationJobUseCase } from "./DeleteEventCancellationExpirationJobUseCase";
import { EventCancellationExpirationJobDurableObject } from "../../EventCancellationExpirationJobDurableObject";
import { LiveEventDataSource } from "../../data/datasource/LiveEventDataSource";
import { SendGoLivePushNotificationUseCase } from "./SendGoLivePushNotificationUseCase";
import { StreamHubDurableObject } from "../../StreamHubDurableObject";

export class StoreLiveEventUseCase {
    constructor(
        d1: D1Database,
        eventCancellationExpirationJob: DurableObjectNamespace<EventCancellationExpirationJobDurableObject>,
        streamHub: DurableObjectNamespace<StreamHubDurableObject>,
        private readonly broadcastUseCase: BroadcastStateTransitionUseCase = new BroadcastStateTransitionUseCase(d1, streamHub),
        private readonly cancelJobUseCase: DeleteEventCancellationExpirationJobUseCase = new DeleteEventCancellationExpirationJobUseCase(d1, eventCancellationExpirationJob),
        private readonly goLivePushNotificationUseCase: SendGoLivePushNotificationUseCase = new SendGoLivePushNotificationUseCase(),
        private readonly liveEventDataSource: LiveEventDataSource = new LiveEventDataSource(d1)
    ) { }

    async execute(videoId: string, name: string, description: string): Promise<void> {
        await this.cancelJobUseCase.execute();
        await this.liveEventDataSource.createOrUpdateLiveEvent(videoId, name, description);
        await this.broadcastUseCase.execute();
        await this.goLivePushNotificationUseCase.execute(name);
    }
}
