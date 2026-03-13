import { NotAValidCancelEventPayloadError } from "../model/NotAValidCancelEventPayloadError";
import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class StoreCancellationUseCase {
    constructor(
        d1: D1Database,
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1),
        private readonly now: () => Date = () => new Date()
    ) { }

    async execute(name: string, cancellationReason: string, timeOfEvent: string): Promise<void> {
        if (new Date(timeOfEvent) <= this.now()) {
            throw new NotAValidCancelEventPayloadError(
                "The cancellation.timeOfEvent must be in the future",
                undefined,
                "The time of the originally scheduled event must be in the future"
            );
        }

        await this.dataSource.createOrUpdateCancellation(name, cancellationReason, timeOfEvent);
    }
}
