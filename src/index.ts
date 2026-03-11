import { ContentfulStatusCode } from "hono/utils/http-status";
import { fromHono } from "chanfana";
import { Hono } from "hono";

import { AuthMiddleware } from "./shared/AuthMiddleware";
import { description, version } from "../package.json";
import { HttpError } from "./shared/domain/model/HttpError";
import { IS_DEV } from "./shared/config";
import { NotFoundError } from "./shared/domain/model/NotFoundError";
import { PublishLiveEvent } from "./live-streaming/PublishLiveEvent";
import { UnknownError } from "./shared/domain/model/UnknownError";

const app = new Hono<{ Bindings: Env }>();
const openapi = fromHono(app, {
    schema: {
        info: {
            title: "Literal Life Church Media API",
            version: version,
            description: description,
        },
        servers: [
            { url: "http://localhost:8787", description: "Development" },
        ],
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    docs_url: IS_DEV ? "/" : null,
    openapi_url: IS_DEV ? "/openapi.json" : null,
});

openapi.registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "HMAC-SHA256",
    description: "The SHA256 HMAC signature for the request. This should be included in the `Authorization` header as a `Bearer` token.<br><br>It is calculated by creating a SHA256 HMAC signature of the request body, adding in a shared secret key, and then encoding the result in base 64 format.<br><br>You can generate your own authorization token in your terminal by running `npm run dev:generate-signature`."
});

// Endpoints that don't require auth
// openapi.post("/live-streaming/v1", PublishLiveEvent);

// Authentication middleware
openapi.use("/live-streaming/v1", AuthMiddleware);

// Endpoints that require auth
openapi.post("/live-streaming/v1", PublishLiveEvent);

openapi.onError((error, context) => {
    let e: HttpError;

    if (error instanceof HttpError) {
        e = error as HttpError;
    } else {
        e = new UnknownError("An unknown error occurred", error);
    }

    return context.json(e.toErrorResponse(), e.statusCode as ContentfulStatusCode);
});

// 404 for everything else
openapi.notFound((context) => {
    const e = new NotFoundError(`No route matched ${context.req.method} ${context.req.path}`);
    return context.json(e.toErrorResponse(), e.statusCode as ContentfulStatusCode);
});

export default app;
