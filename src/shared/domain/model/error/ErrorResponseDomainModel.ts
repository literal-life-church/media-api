import { Num, Obj, Str } from "chanfana";

export function ErrorResponseDomainModel(code: number, message: string, name: string) {
    return Obj({
        code: Num({
            example: code,
            description: "The HTTP status code associated with the error. It is a valid HTTP status code that accurately represents the nature of the error (e.g. `400` for bad request, `401` for unauthorized, `404` for not found, `500` for internal server error, etc.).",
            required: true
        }).min(100).max(599),
        internalMessage: Str({
            example: "An internal error message with more specific debugging details",
            description: "An optional internal message that provides more detailed information about the error for debugging purposes. This message is not exposed to end users, as it may contain sensitive information or technical details that are not relevant to them. This property is only visible in development environments.",
            required: false
        }),
        message: Str({
            example: message,
            description: "A user-friendly message that describes the error in a way that is easy for end users to understand. This message is clear and concise, and avoids technical jargon, sensitive information, or details that may be confusing to non-technical users.",
            required: true
        }),
        name: Str({
            example: name,
            description: "The name of the error, which can be used to identify the type of error that occurred. This is a concise and descriptive name that matches the name of the error class and accurately reflects the nature of the error (e.g. `UnauthorizedError`, etc.).",
            required: true
        })
    }, {
        description: "All available information available to describe the nature of a given error. Contains a user-friendly message, an optional internal message for debugging purposes, a status code, and the name of the error.",
    });
}
