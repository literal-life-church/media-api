import { GetLiveEventUseCase } from "./GetLiveEventUseCase";
import { StreamHubDurableObject } from "../../StreamHubDurableObject";
import { STREAM_HUB_ID } from "../../config";

export class BroadcastStateTransitionUseCase {
    constructor(
        d1: D1Database,
        private readonly streamHub: DurableObjectNamespace<StreamHubDurableObject>,
        private readonly getLiveEventUseCase: GetLiveEventUseCase = new GetLiveEventUseCase(d1)
    ) { }

    async execute(): Promise<void> {
        const state = await this.getLiveEventUseCase.execute();
        const objectId = this.streamHub.idFromName(STREAM_HUB_ID);
        const stub = this.streamHub.get(objectId);

        await stub.fetch(new Request(`http://${STREAM_HUB_ID}/broadcast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state),
        }));
    }
}
