import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class StoreLiveEventUseCase {
    constructor(
        d1: D1Database,
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1)
    ) { }

    async execute(videoId: string, name: string, description: string): Promise<void> {
        await this.dataSource.createOrUpdateLiveEvent(videoId, name, description);
    }
}
