import { LiveEventResponse } from "../../domain/model/response/LiveEventStatusDomainModel";

export class LiveEventMapper {
    map(videoId: string, name: string, description: string): LiveEventResponse {
        return {
            status: "live",
            event: {
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
                watchUrl: `https://www.youtube.com/live/${videoId}`,
                videoId,
                name,
                description,
            },
            cancellation: null,
        };
    }
}
