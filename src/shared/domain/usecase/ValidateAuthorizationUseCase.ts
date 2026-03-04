import { AUTHORIZATION_HEADER, AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD, AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_WEB_CRYPTO, AUTHOTIZATION_SIGNING_SECRET, AUTHOTIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS, AUTHOTIZATION_TIMESTAMP_MINIMUM_OFFSET_MS } from "../../config";
import { PayloadToRequestTimeMapper } from "../../data/mapper/PayloadToRequestTimeMapper";
import { StringToHmacSignatureMapper } from "../../data/mapper/StringToHmacSignatureMapper";

export class ValidateAuthorizationUseCase {
    constructor(
        private readonly encoder: TextEncoder = new TextEncoder(),
        private readonly now: number = Date.now(),
        private readonly payloadToRequestTimeMapper: PayloadToRequestTimeMapper = new PayloadToRequestTimeMapper(),
        private readonly stringToHmacSignatureMapper: StringToHmacSignatureMapper = new StringToHmacSignatureMapper()
    ) { }

    async execute(headers: Record<string, string | undefined>, payload: string): Promise<void> {
        // Step 1: Verify Authorization header is present
        const authorizationHeader = headers[AUTHORIZATION_HEADER];

        if (!authorizationHeader) {
            throw new Error("Authorization header is missing");
        }

        // Step 2: Verify signature matches expected HMAC signature
        const calculatedSignature = this.stringToHmacSignatureMapper.map(payload, AUTHOTIZATION_SIGNING_SECRET);
        const givenSignature = authorizationHeader.replace("Bearer ", "");

        const [providedHash, expectedHash] = await Promise.all([
            crypto.subtle.digest(AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_WEB_CRYPTO, this.encoder.encode(givenSignature)),
            crypto.subtle.digest(AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_WEB_CRYPTO, this.encoder.encode(calculatedSignature)),
        ]);

        if (!crypto.subtle.timingSafeEqual(providedHash, expectedHash)) {
            throw new Error("Invalid authorization");
        }

        // Step 3: Verify a timestamp is included in the payload
        const payloadObject = JSON.parse(payload);

        if (!payloadObject.hasOwnProperty(AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD)) {
            throw new Error("Timestamp is missing from payload");
        }

        // Step 4: Verify the timestamp is within the acceptable range to prevent replay attacks
        const allowedMaximumTimestamp = this.now + AUTHOTIZATION_TIMESTAMP_MAXIMUM_OFFSET_MS;
        const allowedMinimumTimestamp = this.now - AUTHOTIZATION_TIMESTAMP_MINIMUM_OFFSET_MS;

        const timestamp = this.payloadToRequestTimeMapper.map(payload);

        if (timestamp > allowedMinimumTimestamp && timestamp < allowedMaximumTimestamp) {
            console.log("Timestamp is within the acceptable range.");
        }

        throw new Error("Timestamp is out of range");
    }
}
