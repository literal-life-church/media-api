import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class StoreCancellationUseCase {
    constructor(
        d1: D1Database,
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1)
    ) { }

    async execute(name: string, cancellationReason: string, timeOfEvent: string): Promise<void> {
        await this.dataSource.createOrUpdateCancellation(name, cancellationReason, timeOfEvent);
    }
}
