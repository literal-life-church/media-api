import { BroadcastStateTransitionUseCase } from "./BroadcastStateTransitionUseCase";
import { DeleteEventCancellationExpirationJobUseCase } from "./DeleteEventCancellationExpirationJobUseCase";
import { EventCancellationExpirationJobDurableObject } from "../../EventCancellationExpirationJobDurableObject";
import { LiveEventDataSource } from "../../data/datasource/LiveEventDataSource";
import { NotAValidCancelEventPayloadError } from "../model/error/NotAValidCancelEventPayloadError";
import { ScheduleEventCancellationExpirationJobUseCase } from "./ScheduleEventCancellationExpirationJobUseCase";
import { StreamHubDurableObject } from "../../StreamHubDurableObject";

export class StoreCancellationUseCase {
    constructor(
        d1: D1Database,
        eventCancellationExpirationJob: DurableObjectNamespace<EventCancellationExpirationJobDurableObject>,
        streamHub: DurableObjectNamespace<StreamHubDurableObject>,
        private readonly broadcastUseCase: BroadcastStateTransitionUseCase = new BroadcastStateTransitionUseCase(d1, streamHub),
        private readonly cancelJobUseCase: DeleteEventCancellationExpirationJobUseCase = new DeleteEventCancellationExpirationJobUseCase(d1, eventCancellationExpirationJob),
        private readonly liveEventDataSource: LiveEventDataSource = new LiveEventDataSource(d1),
        private readonly scheduleJobUseCase: ScheduleEventCancellationExpirationJobUseCase = new ScheduleEventCancellationExpirationJobUseCase(d1, eventCancellationExpirationJob),
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
        await this.scheduleJobUseCase.execute(expirationTime);
        await this.broadcastUseCase.execute();

        console.info(`Stored cancellation for event "${name}" with reason "${cancellationReason}". Scheduled automatic expiration job to clear this message at ${new Date(expirationTime).toISOString()}.`);
    }
}
