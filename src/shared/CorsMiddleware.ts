import { Context, Next } from "hono";

import { CORS_ALLOWED_HEADERS, CORS_ALLOWED_METHODS, CORS_ALLOWED_ORIGINS, CORS_VARY, X_POWERED_BY } from "./config";

export const CorsMiddleware = async (context: Context, next: Next) => {
    const requestOrigin = context.req.header("origin");
    const matchedOrigin = requestOrigin && cleanCommaList(CORS_ALLOWED_ORIGINS).includes(requestOrigin)
        ? requestOrigin
        : null;

    // Handle preflight with explicit headers — context.header() is not used here because
    // the headers need to be on the response object itself, not injected later by Hono.
    if (context.req.method === "OPTIONS") {
        const preflightHeaders: Record<string, string> = {
            "Connection": "keep-alive",
            "Vary": cleanCommaList(CORS_VARY).join(", "),
            "X-Powered-By": X_POWERED_BY,
        };

        if (matchedOrigin) {
            preflightHeaders["Access-Control-Allow-Credentials"] = "true";
            preflightHeaders["Access-Control-Allow-Headers"] = cleanCommaList(CORS_ALLOWED_HEADERS).join(", ");
            preflightHeaders["Access-Control-Allow-Methods"] = cleanCommaList(CORS_ALLOWED_METHODS).join(", ");
            preflightHeaders["Access-Control-Allow-Origin"] = matchedOrigin;
        }

        return context.body(null, 204, preflightHeaders);
    }

    await next();

    // Build the response explicitly rather than relying on Hono's context.header() injection.
    // Hono's finalize() step cannot reliably wrap streaming responses returned directly from
    // Durable Object stubs, so CORS headers would be silently dropped for SSE connections.
    const headers = new Headers(context.res.headers);
    headers.set("Connection", "keep-alive");
    headers.set("Vary", cleanCommaList(CORS_VARY).join(", "));
    headers.set("X-Powered-By", X_POWERED_BY);

    if (matchedOrigin) {
        headers.set("Access-Control-Allow-Credentials", "true");
        headers.set("Access-Control-Allow-Headers", cleanCommaList(CORS_ALLOWED_HEADERS).join(", "));
        headers.set("Access-Control-Allow-Methods", cleanCommaList(CORS_ALLOWED_METHODS).join(", "));
        headers.set("Access-Control-Allow-Origin", matchedOrigin);
    }

    context.res = new Response(context.res.body, {
        status: context.res.status,
        statusText: context.res.statusText,
        headers,
    });
};

function cleanCommaList(list: string): string[] {
    return list.split(",").map(item => item.trim()).filter(Boolean);
}
