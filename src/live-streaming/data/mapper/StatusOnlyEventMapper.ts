import { LiveEventResponse } from "../../domain/model/response/LiveEventStatusDomainModel";

export class StatusOnlyEventMapper {
    map(status: "offline" | "prewarming"): LiveEventResponse {
        return { status, event: null, cancellation: null };
    }
}
