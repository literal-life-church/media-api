/**
 * Development utility to generate an HMAC-SHA256 signature for testing authenticated endpoints.
 * Run with: npx tsx run/generate-signature.ts
 */

import { createHmac } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { execSync } from "node:child_process";
import { stdin, stdout } from "node:process";

import { AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD, AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_NODE_CRYPTO, AUTHORIZATION_REQUEST_SIGNATURE_ENCODING, AUTHORIZATION_SIGNING_SECRET } from "../src/shared/config";

const rl = createInterface({ input: stdin, output: stdout });

function readMultilineJson(): Promise<string> {
    return new Promise((resolve) => {
        console.log(`Paste your JSON payload below.\nYou may omit the ${AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD} field, it will be added automatically or updated to the current time.\nThen press Enter on a blank line.\n\nYour JSON:`);

        const lines: string[] = [];

        function handler(line: string) {
            if (line.trim() === "") {
                rl.off("line", handler);
                resolve(lines.join("\n"));
            } else {
                lines.push(line);
            }
        }

        rl.on("line", handler);
    });
}

async function main() {
    // Step 1: Read JSON payload
    const rawJson = await readMultilineJson();
    let payload: Record<string, unknown>;

    try {
        payload = JSON.parse(rawJson);
    } catch {
        console.error("\nError: Invalid JSON. Please try again.");
        rl.close();
        process.exit(1);
    }

    // Step 2: Inject requestTime with the current time (overwriting any existing value)
    const requestTimeLabel = AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD in payload
        ? `Request Body (${AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD} updated to current time)`
        : `Request Body (${AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD} added)`;

    payload[AUTHORIZATION_PAYLOAD_REQUEST_TIME_FIELD] = new Date().toISOString();

    // Step 3: Generate signature (must match StringToHmacSignatureMapper)
    const payloadString = JSON.stringify(payload);
    const signature = createHmac(AUTHORIZATION_REQUEST_SIGNATURE_ALGORITHM_NODE_CRYPTO, AUTHORIZATION_SIGNING_SECRET)
        .update(payloadString)
        .digest(AUTHORIZATION_REQUEST_SIGNATURE_ENCODING);

    const clipboardCommand = process.platform === "win32" ? "clip"
        : process.platform === "darwin" ? "pbcopy"
            : "xclip -selection clipboard";

    // Step 4: Print request body and offer to copy to clipboard
    console.log(`\n--- ${requestTimeLabel} ---`);
    console.log(JSON.stringify(payload, null, 2));

    const copyBody = await rl.question("\nPress y to copy the request body to your clipboard: ");
    if (copyBody.trim().toLowerCase() === "y") {
        execSync(clipboardCommand, { input: JSON.stringify(payload, null, 2) });
        console.log("Copied! Paste it as your request body, then come back here when ready.");
    }

    // Step 5: Print signature and offer to copy to clipboard
    console.log("\n--- Generated Signature ---");
    console.log(signature);

    const copySignature = await rl.question("\nPress y to copy the signature to your clipboard: ");
    if (copySignature.trim().toLowerCase() === "y") {
        execSync(clipboardCommand, { input: signature });
        console.log("Copied!");
    }

    rl.close();
}

main();
