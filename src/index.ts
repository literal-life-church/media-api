import { fromHono } from "chanfana";
import { Hono } from "hono";

import { PublishLiveEvent } from "./live-streaming/PublishLiveEvent";

const app = new Hono<{ Bindings: Env }>();
const openapi = fromHono(app, {
    schema: {
        info: {
            title: "Literal Life Church Media API",
            version: '1.0',
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
    description: "The SHA256 HMAC signature for the request. This should be included in the `Authorization` header as a `Bearer token`. It is calculated by creating a SHA256 HMAC signature of the request body, using a shared secret key, and then encoding the result in base64 format. Try it with an online tool, the [HMAC Generator](https://www.magicbell.com/tools/hmac-generator). When doing this by hand, you'll want a JSON body that doesn't have any unnecessary whitespace, as that will change the signature. You can paste your payload over [here](https://jsonformatter.org/) and use the *Minify/Compact* button before piping the output into the [HMAC Generator](https://www.magicbell.com/tools/hmac-generator)."
});

// API Key Authentication Middleware
const apiKeyAuthMiddleware = async (c, next) => {
    const signature = c.req.header('Authorization')?.replace("Bearer ", ""); // Extract API key from Authorization header
    if (!signature) { // Validate against API_KEY environment variable
        console.log("YIKES");
    }

    await next();
};

// Endpoints that don't require auth
// openapi.post("/live-streaming/v1", PublishLiveEvent);

// Authentication middleware
openapi.use("/live-streaming/v1", apiKeyAuthMiddleware);

// Endpoints that require auth
openapi.post("/live-streaming/v1", PublishLiveEvent);

export default app;
