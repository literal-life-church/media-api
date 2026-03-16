import { contentJson } from "chanfana";

import { ErrorResponseDomainModel } from "./ErrorResponseDomainModel";
import { IS_DEV } from "../../../config";

export class HttpError extends Error {
    static readonly statusCode: number = 500;
    static readonly publicMessage: string = "An error occurred";
    static readonly errorName: string = "GenericHttpError";
    static readonly schemaDescription: string = "An error occurred while processing the request. This is a generic error response, and more specific error types should be used whenever possible to provide more accurate information about the nature of the error.";

    private readonly internalMessage: string;
    private readonly isDevEnvironment: boolean;
    public readonly publicMessage: string;
    readonly statusCode: number;

    constructor(internalMessage: string, cause?: unknown, publicMessage?: string) {
        const ctor = new.target as typeof HttpError;
        const resolvedPublicMessage = publicMessage ?? ctor.publicMessage;

        super(IS_DEV ? internalMessage : resolvedPublicMessage);
        this.isDevEnvironment = IS_DEV;

        this.cause = cause;
        this.internalMessage = internalMessage;
        this.publicMessage = resolvedPublicMessage;
        this.name = ctor.errorName;
        this.statusCode = ctor.statusCode;

        if (!cause) {
            console.error(`${ctor.statusCode}: [${ctor.errorName}] \nPUBLIC MESSAGE: ${resolvedPublicMessage}\nINTERNAL MESSAGE: ${internalMessage}`);
        } else {
            console.error(`${ctor.statusCode}: [${ctor.errorName}] \nPUBLIC MESSAGE: ${resolvedPublicMessage}\nINTERNAL MESSAGE: ${internalMessage}\n\nCAUSE:`, cause);
        }
    }

    toErrorResponse() {
        return {
            code: this.statusCode,
            internalMessage: this.isDevEnvironment ? this.internalMessage : undefined,
            message: this.publicMessage,
            name: this.name
        };
    }

    // Based on Chanfana's ApiException schema, but adapted for our HttpError class
    // See: https://github.com/cloudflare/chanfana/blob/9b02677468807d49224eb63a3cfb3e1a8fcd922b/src/exceptions.ts#L26
    static schema() {
        return {
            [this.statusCode]: {
                description: this.schemaDescription,
                ...contentJson(ErrorResponseDomainModel(
                    this.statusCode,
                    this.publicMessage,
                    this.errorName
                ))
            }
        };
    }
}
