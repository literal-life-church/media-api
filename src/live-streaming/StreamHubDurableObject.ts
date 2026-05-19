import { DurableObject } from "cloudflare:workers";

import { LiveEventResponse } from "./domain/model/response/LiveEventStatusDomainModel";
import { STREAM_HUB_CLOSING_STATUSES, STREAM_HUB_EVENT_NAME, STREAM_HUB_PING_INTERVAL_MS } from "./config";

export class StreamHubDurableObject extends DurableObject<Env> {
    constructor(
        ctx: DurableObjectState,
        env: Env,
        private readonly connections = new Set<WritableStreamDefaultWriter<Uint8Array>>(),
        private readonly encoder = new TextEncoder()
    ) {
        super(ctx, env);
    }

    // You can make a request to this Durable Object by sending a request to the `stream_hub` Durable Object namespace binding, which is defined in the `Env` interface.
    //
    // For example:
    // const objectId = env.STREAM_HUB.idFromName(STREAM_HUB_ID); // where `STREAM_HUB_ID` is a constant string that identifies this Durable Object instance.
    // const stub = env.STREAM_HUB.get(objectId);
    //
    // await stub.fetch(new Request(`http://${STREAM_HUB_ID}/some-path`, {
    //     method: "POST",
    //     body: "Hello, Durable Object!"
    // }));
    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url);

        // Triggered internally to broadcast live event state changes to subscribers
        if (url.pathname.endsWith("/broadcast"))
            return this.handleBroadcast(request);

        // Triggered by external clients subscribing to live event state changes
        if (url.pathname.endsWith("/subscribe"))
            return this.handleSubscribe(request);

        return new Response(null, { status: 404 });
    }

    private async handleBroadcast(request: Request): Promise<Response> {
        let state: LiveEventResponse;

        try {
            state = await request.json() as LiveEventResponse;
        } catch {
            return new Response(null, { status: 400 });
        }

        const message = this.encoder.encode(`event: ${STREAM_HUB_EVENT_NAME}\ndata: ${JSON.stringify(state)}\n\n`);
        const shouldClose = STREAM_HUB_CLOSING_STATUSES.has(state.status);
        const dead: WritableStreamDefaultWriter<Uint8Array>[] = [];

        for (const writer of this.connections) {
            try {
                await writer.write(message);

                if (shouldClose) {
                    await writer.close();
                    dead.push(writer);
                }
            } catch {
                dead.push(writer);
            }
        }

        for (const writer of dead) {
            this.connections.delete(writer);
        }

        console.info(`Broadcasted event "${STREAM_HUB_EVENT_NAME}" with status "${state.status}" to ${this.connections.size} subscribers.`);
        return new Response(null, { status: 204 });
    }

    private handleSubscribe(request: Request): Response {
        const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
        const writer = writable.getWriter();

        this.connections.add(writer);

        request.signal.addEventListener("abort", () => {
            this.connections.delete(writer);
            writer.close().catch(() => { });
        });

        this.ctx.waitUntil(this.pingLoop(writer, request.signal));
        console.info(`New subscriber added. Total subscribers: ${this.connections.size}.`);

        return new Response(readable, {
            headers: {
                "Cache-Control": "no-cache",
                "Content-Type": "text/event-stream",
            },
        });
    }

    private async pingLoop(writer: WritableStreamDefaultWriter<Uint8Array>, signal: AbortSignal): Promise<void> {
        while (!signal.aborted) {
            await new Promise<void>((resolve) => setTimeout(resolve, STREAM_HUB_PING_INTERVAL_MS));
            if (signal.aborted) break;

            try {
                await writer.write(this.encoder.encode(": ping\n\n"));
            } catch {
                this.connections.delete(writer);
                break;
            }
        }
    }
}
