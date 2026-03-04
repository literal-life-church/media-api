import { AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD } from "../../config";
import { GenericMapper } from "./GenericMapper";

export class PayloadToRequestTimeMapper implements GenericMapper<string, number> {
    map(payload: string): number {
        const payloadObject = JSON.parse(payload);

        if (!payloadObject.hasOwnProperty(AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD)) {
            return new Date(0).getTime(); // Return epoch time if the field is missing, which will be out of range
        }

        return new Date(payloadObject[AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD]).getTime();
    }
}
