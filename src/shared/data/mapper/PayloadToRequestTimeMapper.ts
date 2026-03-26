import { AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD } from "../../config";
import { GenericMapper } from "./GenericMapper";

export class PayloadToRequestTimeMapper implements GenericMapper<object, number> {
    map(payload: object): number {
        if (!payload.hasOwnProperty(AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD)) {
            return new Date(0).getTime(); // Return epoch time if the field is missing, which will be out of range
        }

        return new Date(payload[AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD]).getTime();
    }
}
