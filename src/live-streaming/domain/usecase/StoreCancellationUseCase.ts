import { ActiveJobsDataSource } from "../../data/datasource/ActiveJobsDataSource";
import { DeleteEventCancellationExpirationJobUseCase } from "./DeleteEventCancellationExpirationJobUseCase";
import { EventCancellationDurableObject } from "../../EventCancellationDurableObject";
import { NotAValidCancelEventPayloadError } from "../model/error/NotAValidCancelEventPayloadError";
import { LiveEventDataSource } from "../../data/datasource/LiveEventDataSource";

export class StoreCancellationUseCase {
    constructor(
        d1: D1Database,
        private readonly doNamespace: DurableObjectNamespace<EventCancellationDurableObject>,
        private readonly activeJobsDataSource: ActiveJobsDataSource = new ActiveJobsDataSource(d1),
        private readonly cancelJobUseCase: DeleteEventCancellationExpirationJobUseCase = new DeleteEventCancellationExpirationJobUseCase(d1, doNamespace),
        private readonly liveEventDataSource: LiveEventDataSource = new LiveEventDataSource(d1),
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
        await this.liveEventDataSource.createOrUpdateCancellation(name, cancellationReason, timeOfEvent);

        const expirationTime = new Date(timeOfEvent).getTime() + cancellationExpiration;

        // TODO move this to a use case.
        // TODO why multiple IDs?
        const stub = this.doNamespace.get(this.doNamespace.idFromName("event-cancellation"));
        await stub.scheduleExpiration(expirationTime);
        await this.activeJobsDataSource.insertPendingEventCancellationExpirationJob(crypto.randomUUID());
    }
}
