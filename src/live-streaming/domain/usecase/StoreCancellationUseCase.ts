import { CancelEventCancellationJobUseCase } from "./CancelEventCancellationJobUseCase";
import { EventCancellationDurableObject } from "../../EventCancellationDurableObject";
import { NotAValidCancelEventPayloadError } from "../model/error/NotAValidCancelEventPayloadError";
import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class StoreCancellationUseCase {
    constructor(
        d1: D1Database,
        private readonly doNamespace: DurableObjectNamespace<EventCancellationDurableObject>,
        private readonly cancelJobUseCase: CancelEventCancellationJobUseCase = new CancelEventCancellationJobUseCase(d1, doNamespace),
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1),
        private readonly now: () => Date = () => new Date()
    ) { }

    async execute(name: string, cancellationReason: string, timeOfEvent: string, cancellationExpiration: number): Promise<void> {
        if (new Date(timeOfEvent) <= this.now()) {
            throw new NotAValidCancelEventPayloadError(
                "The timeOfEvent must be in the future",
                undefined,
                "The time of the originally scheduled event must be in the future"
            );
        }

        await this.cancelJobUseCase.execute();
        await this.dataSource.createOrUpdateCancellation(name, cancellationReason, timeOfEvent);

        const expirationTime = new Date(timeOfEvent).getTime() + cancellationExpiration;

        // TODO move this to a use case.
        // TODO why multiple IDs?
        const stub = this.doNamespace.get(this.doNamespace.idFromName("event-cancellation"));
        await stub.scheduleExpiration(expirationTime);
        await this.dataSource.insertPendingEventCancellationExpirationJob(crypto.randomUUID());
    }
}
