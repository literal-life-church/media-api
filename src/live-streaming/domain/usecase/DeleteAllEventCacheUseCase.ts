import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { LiveEventDataSource } from "../../data/datasource/LiveEventDataSource";

export class DeleteAllEventCacheUseCase {
    constructor(
        d1: D1Database,
        private readonly activeJobsDataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1),
        private readonly liveEventDataSource: LiveEventDataSource = new LiveEventDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        await this.activeJobsDataSource.deletePendingEventCancellationExpirationJobs();
        await this.liveEventDataSource.deleteLiveEvent();
    }
}
