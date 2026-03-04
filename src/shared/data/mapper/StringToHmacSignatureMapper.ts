import { AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_NODE_CRYPTO, AUTHORIZATION_REQUEST_SIGNATURE_ENCODING } from "../../config";
import { createHmac } from "node:crypto";

export class StringToHmacSignatureMapper {
    map(input: string, secret: string): string {
        return createHmac(AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_NODE_CRYPTO, secret)
            .update(input)
            .digest(AUTHORIZATION_REQUEST_SIGNATURE_ENCODING);
    }
}
