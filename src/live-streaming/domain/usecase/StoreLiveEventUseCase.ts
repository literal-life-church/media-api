import { StoreLiveEventDataSource } from "../../data/datasource/StoreLiveEventDataSource";

export class StoreLiveEventUseCase {
    constructor(private readonly dataSource: StoreLiveEventDataSource) { }

    async execute(videoId: string, name: string, description: string): Promise<void> {
        await this.dataSource.createOrUpdateLiveEvent(videoId, name, description, "live");
    }
}
