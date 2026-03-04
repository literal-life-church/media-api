import { contentJson, OpenAPIRoute } from "chanfana";
import { type AppContext } from "../types";
import { OPENAPI_TAGS } from "./config";
import { OngoingLiveEventDomainModel } from "./domain/model/OngoingLiveEventDomainModel";
import { PublishLiveEventDataModel } from "./data/model/PublishLiveEventDataModel";
import { StringToHmacSignatureMapper } from "../shared/data/mapper/StringToHmacSignatureMapper";
import { HttpError } from "../shared/domain/model/HttpError";

export class PublishLiveEvent extends OpenAPIRoute {
	schema = {
		tags: OPENAPI_TAGS,
		summary: "Publish the metadata for a Live Event on YouTube",
		request: {
			body: contentJson(PublishLiveEventDataModel),
		},
		responses: {
			"200": {
				description: "Returns the captured and transformed metadata for the published Live Event",
				...contentJson(OngoingLiveEventDomainModel),
			},
            ...HttpError.schema(),
            ...HttpError.schema()
		},
	};

	async handle(c: AppContext) {
		// Get validated data
		const data = await this.getValidatedData<typeof this.schema>();

		// Retrieve the validated request body
		const liveEventPayload = data.body;
        const cleanBody = JSON.stringify(liveEventPayload);

		// Implement your own object insertion here
        const mapper = new StringToHmacSignatureMapper();
        const calculatedSignature = mapper.map(cleanBody, "ABC-123");
        const givenSignature = c.req.header('authorization')?.replace("Bearer ", "") ?? "No signature provided";

        const encoder = new TextEncoder();

        const [providedHash, expectedHash] = await Promise.all([
            crypto.subtle.digest("SHA-256", encoder.encode(givenSignature)),
            crypto.subtle.digest("SHA-256", encoder.encode(calculatedSignature)),
        ]);

        if (crypto.subtle.timingSafeEqual(providedHash, expectedHash)) {
            console.log("Signatures match. Request is authentic.");
        }

		return {
			status: "live",
            event: {
                embedUrl: `https://www.youtube.com/embed/${liveEventPayload.videoId}`,
                watchUrl: `https://www.youtube.com/live/${liveEventPayload.videoId}`,
                videoId: liveEventPayload.videoId,
                name: liveEventPayload.name,
                description: liveEventPayload.description,
            },
            cancellation: null,
		};
	}
}
