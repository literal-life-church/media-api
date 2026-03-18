import { ContentfulStatusCode } from "hono/utils/http-status";
import { extendZodWithOpenApi, fromHono } from "chanfana";
import { Hono } from "hono";
import { z } from "zod";

import { AuthMiddleware } from "./shared/AuthMiddleware";
import { CancelEventController } from "./live-streaming/CancelEventController";
import { description, version } from "../package.json";
import { GetLiveEventController } from "./live-streaming/GetLiveEventController";
import { HttpError } from "./shared/domain/model/error/HttpError";
import { IS_DEV } from "./shared/config";
import { NotFoundError } from "./shared/domain/model/error/NotFoundError";
import { PrewarmLiveEventController } from "./live-streaming/PrewarmLiveEventController";
import { PublishLiveEventController } from "./live-streaming/PublishLiveEventController";
import { UnknownError } from "./shared/domain/model/error/UnknownError";
import { UnpublishLiveEventController } from "./live-streaming/UnpublishLiveEventController";

extendZodWithOpenApi(z);

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
    docs_url: IS_DEV ? "/try" : null,
    redoc_url: IS_DEV ? "/docs" : null,
    openapi_url: IS_DEV ? "/openapi.json" : null,
});

openapi.registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "HMAC-SHA256",
    description: "The SHA256 HMAC signature for the request. This should be included in the `Authorization` header as a `Bearer` token.<br><br>It is calculated by creating a SHA256 HMAC signature of the request body, adding in a shared secret key, and then encoding the result in base 64 format.<br><br>You can generate your own authorization token in your terminal by running `npm run dev:generate-signature`."
});

// Endpoints that don't require auth
openapi.get("/live-streaming", GetLiveEventController);

// Authentication middleware
openapi.use("/live-streaming/*", AuthMiddleware);

// Endpoints that require auth
openapi.delete("/live-streaming", UnpublishLiveEventController);
openapi.post("/live-streaming/cancel", CancelEventController);
openapi.post("/live-streaming/go-live", PublishLiveEventController);
openapi.post("/live-streaming/prewarm", PrewarmLiveEventController);

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

// All Durable Object bindings must be exported from the entry module
export { EventCancellationExpirationJobDurableObject } from "./live-streaming/EventCancellationExpirationJobDurableObject"

export default app;
