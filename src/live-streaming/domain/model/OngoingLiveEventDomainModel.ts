import { LiveStreamingResponseDomainModel } from "./LiveStreamingResponseDomainModel";
import { z } from "zod";

export const OngoingLiveEventDomainModel = LiveStreamingResponseDomainModel.extend({
    "cancellation": z.null()
}).describe("Describes the metadata of a live event, which includes the current status of the event (always `live`, in this scenario), and the details of the live event. The `cancellation` field is always null for an ongoing live event, as it has not been canceled.");
