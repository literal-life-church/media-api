import { LiveEventResponse } from "../../domain/model/response/LiveEventStatusDomainModel";

export class CanceledEventMapper {
    map(name: string, cancellationReason: string, timeOfEvent: string): LiveEventResponse {
        return {
            status: "canceled",
            event: null,
            cancellation: {
                reason: cancellationReason,
                name,
                timeOfEvent,
            },
        };
    }
}
