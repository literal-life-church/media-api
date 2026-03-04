import { contentJson } from "chanfana";
import { ENVIRONMENT_TYPE } from "../../config";
import { ErrorResponseDomainModel } from "./ErrorResponseDomainModel";

export class HttpError extends Error {
    private readonly internalMessage: string;
    private readonly isDevEnvironment: boolean;
    public readonly publicMessage: string;
    statusCode: number;

    constructor(
        internalMessage: string = "An unknown error occurred",
        publicMessage: string = "An error occurred",
        statusCode: number = 500,
        name: string = "GenericHttpError",
        cause?: unknown
    ) {
        const isDev = ENVIRONMENT_TYPE.toLocaleLowerCase().trim() === "development";

        super(isDev ? internalMessage : publicMessage);
        this.isDevEnvironment = isDev;

        this.cause = cause;
        this.internalMessage = internalMessage;
        this.publicMessage = publicMessage;
        this.name = name;
        this.statusCode = statusCode;

        console.error(`${statusCode}: [${name}] \n\nPUBLIC MESSAGE: ${publicMessage}\nINTERNAL MESSAGE: ${internalMessage }`, cause);
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
        const inst = new this();

        return {
            [inst.statusCode]: {
                description: inst.publicMessage,
                ...contentJson(ErrorResponseDomainModel)
            }
        }
    };
}
