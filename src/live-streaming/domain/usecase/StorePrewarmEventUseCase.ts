import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class StorePrewarmEventUseCase {
    constructor(
        d1: D1Database,
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1)
    ) { }

    async execute(): Promise<void> {
        await this.dataSource.createOrUpdatePrewarmEvent();
    }
}
