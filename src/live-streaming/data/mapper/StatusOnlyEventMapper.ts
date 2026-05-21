import { GenericMapper } from "../../../shared/data/mapper/GenericMapper";
import { LiveEventResponse } from "../../domain/model/response/LiveEventStatusDomainModel";

export class StatusOnlyEventMapper implements GenericMapper<"offline" | "prewarming", LiveEventResponse> {
    map(status: "offline" | "prewarming"): LiveEventResponse {
        return { status, event: null, cancellation: null };
    }
}
