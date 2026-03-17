import { CanceledEventMapper } from "../../data/mapper/CanceledEventMapper";
import { LiveEventDataSource } from "../../data/datasource/LiveEventDataSource";
import { LiveEventMapper } from "../../data/mapper/LiveEventMapper";
import { LiveEventResponse } from "../model/response/LiveEventStatusDomainModel";
import { StatusOnlyEventMapper } from "../../data/mapper/StatusOnlyEventMapper";

export class GetLiveEventUseCase {
    constructor(
        d1: D1Database,
        private readonly canceledEventMapper: CanceledEventMapper = new CanceledEventMapper(),
        private readonly dataSource: LiveEventDataSource = new LiveEventDataSource(d1),
        private readonly liveEventMapper: LiveEventMapper = new LiveEventMapper(),
        private readonly statusOnlyMapper: StatusOnlyEventMapper = new StatusOnlyEventMapper()
    ) { }

    async execute(): Promise<LiveEventResponse> {
        const row = await this.dataSource.getLiveEvent();

        if (!row) return this.statusOnlyMapper.map("offline");
        if (row.status === "live") return this.liveEventMapper.map(row.videoId, row.name, row.description);
        if (row.status === "canceled") return this.canceledEventMapper.map(row.name, row.cancellationReason, row.timeOfEvent);

        return this.statusOnlyMapper.map(row.status as "offline" | "prewarming");
    }
}
