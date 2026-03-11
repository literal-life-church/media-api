import { contentJson } from "chanfana";

import { ENVIRONMENT_TYPE } from "../../config";
import { ErrorResponseDomainModel } from "./ErrorResponseDomainModel";

export class HttpError extends Error {
    static readonly statusCode: number = 500;
    static readonly publicMessage: string = "An error occurred";
    static readonly errorName: string = "GenericHttpError";
    static readonly schemaDescription: string = "An error occurred while processing the request. This is a generic error response, and more specific error types should be used whenever possible to provide more accurate information about the nature of the error.";

    private readonly internalMessage: string;
    private readonly isDevEnvironment: boolean;
    public readonly publicMessage: string;
    readonly statusCode: number;

    constructor(internalMessage: string, cause?: unknown) {
        const ctor = new.target as typeof HttpError;
        const isDev = ENVIRONMENT_TYPE.toLocaleLowerCase().trim() === "development";

        super(isDev ? internalMessage : ctor.publicMessage);
        this.isDevEnvironment = isDev;

        this.cause = cause;
        this.internalMessage = internalMessage;
        this.publicMessage = ctor.publicMessage;
        this.name = ctor.errorName;
        this.statusCode = ctor.statusCode;

        if (!cause) {
            console.error(`${ctor.statusCode}: [${ctor.errorName}] \nPUBLIC MESSAGE: ${ctor.publicMessage}\nINTERNAL MESSAGE: ${internalMessage}`);
        } else {
            console.error(`${ctor.statusCode}: [${ctor.errorName}] \nPUBLIC MESSAGE: ${ctor.publicMessage}\nINTERNAL MESSAGE: ${internalMessage}\n\nCAUSE:`, cause);
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
