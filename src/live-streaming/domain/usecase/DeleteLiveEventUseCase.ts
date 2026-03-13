import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class DeleteLiveEventUseCase {
    constructor(
        d1: D1Database,
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        await this.dataSource.deleteLiveEvent();
    }
}
