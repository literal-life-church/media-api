import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { BroadcastStateTransitionUseCase } from "./BroadcastStateTransitionUseCase";
import { LiveEventDataSource } from "../../data/datasource/LiveEventDataSource";
import { StreamHubDurableObject } from "../../StreamHubDurableObject";

export class DeleteAllEventCacheUseCase {
    constructor(
        d1: D1Database,
        streamHub: DurableObjectNamespace<StreamHubDurableObject>,
        private readonly activeJobsDataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1),
        private readonly broadcastUseCase: BroadcastStateTransitionUseCase = new BroadcastStateTransitionUseCase(d1, streamHub),
        private readonly liveEventDataSource: LiveEventDataSource = new LiveEventDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        await this.activeJobsDataSource.deletePendingEventCancellationExpirationJobs();
        await this.liveEventDataSource.deleteLiveEvent();
        await this.broadcastUseCase.execute();
    }
}
