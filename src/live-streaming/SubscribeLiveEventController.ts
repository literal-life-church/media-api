import { type AppContext } from "../index";
import { STREAM_HUB_ID } from "./config";

export const SubscribeToLiveEventStateChangesController = async (c: AppContext): Promise<Response> => {
    const objectId = c.env.STREAM_HUB.idFromName(STREAM_HUB_ID);
    const stub = c.env.STREAM_HUB.get(objectId);

    return stub.fetch(c.req.raw);
};
