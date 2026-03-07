import { ContentfulStatusCode } from "hono/utils/http-status";
import { fromHono } from "chanfana";
import { Hono } from "hono";
import { version } from "../package.json";

import { AuthMiddleware } from "./shared/AuthMiddleware";
import { HttpError } from "./shared/domain/model/HttpError";
import { PublishLiveEvent } from "./live-streaming/PublishLiveEvent";
import { UnknownError } from "./shared/domain/model/UnknownError";

const app = new Hono<{ Bindings: Env }>();
const openapi = fromHono(app, {
    schema: {
        info: {
            title: "Literal Life Church Media API",
            version: version,
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    docs_url: "/",
});

openapi.registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "HMAC-SHA256",
    description: "The SHA256 HMAC signature for the request. This should be included in the `Authorization` header as a `Bearer` token.<br><br>It is calculated by creating a SHA256 HMAC signature of the request body, adding in a shared secret key, and then encoding the result in base 64 format. Try it with an online tool, the [HMAC Generator](https://www.magicbell.com/tools/hmac-generator).<br><br>When doing this process by hand, you'll want a JSON body that doesn't have any unnecessary whitespace, as that will change the signature. You can paste your payload over [here](https://jsonformatter.org/) and use the *Minify/Compact* button before piping the output into the [HMAC Generator](https://www.magicbell.com/tools/hmac-generator)."
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

export default app;
