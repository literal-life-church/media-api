import { Context, Next } from "hono";

import { CORS_ALLOWED_HEADERS, CORS_ALLOWED_METHODS, CORS_ALLOWED_ORIGINS, CORS_VARY, X_POWERED_BY } from "./config";

export const CorsMiddleware = async (context: Context, next: Next) => {
    context.header("Connection", "keep-alive");
    context.header("Vary", cleanCommaList(CORS_VARY).join(", "), { append: true });
    context.header("X-Powered-By", X_POWERED_BY);

    const requestOrigin = context.req.header("origin");
    const matchedOrigin = requestOrigin && cleanCommaList(CORS_ALLOWED_ORIGINS).includes(requestOrigin)
        ? requestOrigin
        : null;

    if (matchedOrigin) {
        context.header("Access-Control-Allow-Credentials", "true");
        context.header("Access-Control-Allow-Headers", cleanCommaList(CORS_ALLOWED_HEADERS).join(", "));
        context.header("Access-Control-Allow-Methods", cleanCommaList(CORS_ALLOWED_METHODS).join(", "));
        context.header("Access-Control-Allow-Origin", matchedOrigin);

        // For browser preflight requests
        if (context.req.method === "OPTIONS") {
            return context.body(null, 204);
        }
    }

    await next();
};

function cleanCommaList(list: string): string[] {
    return list.split(",").map(item => item.trim()).filter(Boolean);
}
