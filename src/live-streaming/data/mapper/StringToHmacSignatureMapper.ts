import { createHmac } from "node:crypto";
import { REQUEST_SIGNATURE_ALGORITHM, REQUEST_SIGNATURE_ENCODING } from "../../config";

export class StringToHmacSignatureMapper {
    map(input: string, secret: string): string {
        return createHmac(REQUEST_SIGNATURE_ALGORITHM, secret)
            .update(input)
            .digest(REQUEST_SIGNATURE_ENCODING);
    }
}
