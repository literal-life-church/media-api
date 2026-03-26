import { AUTHORIZATION_HEADER, AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD, AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_WEB_CRYPTO, AUTHORIZATION_SIGNING_SECRET, AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS, AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS } from "../../config";
import { PayloadToRequestTimeMapper } from "../../data/mapper/PayloadToRequestTimeMapper";
import { StringToHmacSignatureMapper } from "../../data/mapper/StringToHmacSignatureMapper";
import { UnauthorizedError } from "../model/error/UnauthorizedError";

export class ValidateAuthorizationUseCase {
    constructor(
        private readonly encoder: TextEncoder = new TextEncoder(),
        private readonly now: number = Date.now(),
        private readonly payloadToRequestTimeMapper: PayloadToRequestTimeMapper = new PayloadToRequestTimeMapper(),
        private readonly stringToHmacSignatureMapper: StringToHmacSignatureMapper = new StringToHmacSignatureMapper()
    ) { }

    async execute(headers: Record<string, string | undefined>, payload: object): Promise<void> {
        // Step 1: Verify Authorization header is present
        const authorizationHeader = headers[AUTHORIZATION_HEADER];

        if (!authorizationHeader) {
            throw new UnauthorizedError("Missing the Authorization header");
        }

        // Step 2: Verify signature matches expected HMAC signature
        const payloadString = JSON.stringify(payload); // Ensure consistent stringification for signature calculation

        const calculatedSignature = this.stringToHmacSignatureMapper.map(payloadString, AUTHORIZATION_SIGNING_SECRET);
        const givenSignature = authorizationHeader.replace("Bearer ", "");

        const [providedHash, expectedHash] = await Promise.all([
            crypto.subtle.digest(AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_WEB_CRYPTO, this.encoder.encode(givenSignature)),
            crypto.subtle.digest(AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_WEB_CRYPTO, this.encoder.encode(calculatedSignature)),
        ]);

        if (!crypto.subtle.timingSafeEqual(providedHash, expectedHash)) {
            throw new UnauthorizedError("Incorrect bearer token");
        }

        // Step 3: Verify a timestamp is included in the payload
        if (!payload.hasOwnProperty(AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD)) {
            throw new UnauthorizedError(`Missing the \`${AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD}\` in the root of the payload`);
        }

        // Step 4: Verify the timestamp is within the acceptable range to prevent replay attacks
        const allowedMaximumTimestamp = this.now + AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS;
        const allowedMinimumTimestamp = this.now - AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS;

        const timestamp = this.payloadToRequestTimeMapper.map(payload);

        if (timestamp > allowedMinimumTimestamp && timestamp < allowedMaximumTimestamp) {
            console.log("Request is authorized");
            return;
        }

        throw new UnauthorizedError(`The request has expired. Please send a new request with the \`${AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD}\` in the root of the payload indicating the current time when the request was made. Must be within ${AUTHORIZATION_TIMESTAMP_MINIMUM_OFFSET_MS}ms before to ${AUTHORIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS}ms after the current time.`);
    }
}
