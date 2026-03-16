import { LiveEventResponse } from "../model/response/LiveEventStatusDomainModel";
import { PersistentDataSource } from "../../data/datasource/PersistentDataSource";

export class GetLiveEventUseCase {
    constructor(
        d1: D1Database,
        private readonly dataSource: PersistentDataSource = new PersistentDataSource(d1)
    ) { }

    async execute(): Promise<LiveEventResponse> {
        const row = await this.dataSource.getLiveEvent();

        if (!row) {
            return { status: "offline", event: null, cancellation: null };
        }

        if (row.status === "live") {
            return {
                status: "live",
                event: {
                    embedUrl: `https://www.youtube.com/embed/${row.videoId}`,
                    watchUrl: `https://www.youtube.com/live/${row.videoId}`,
                    videoId: row.videoId,
                    name: row.name,
                    description: row.description,
                },
                cancellation: null,
            };
        }

        if (row.status === "canceled") {
            return {
                status: "canceled",
                event: null,
                cancellation: {
                    reason: row.cancellationReason,
                    name: row.name,
                    timeOfEvent: row.timeOfEvent,
                },
            };
        }

        return { status: row.status, event: null, cancellation: null };
    }
}
