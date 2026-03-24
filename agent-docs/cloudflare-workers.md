# Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## Durable Objects

LLMs.txt: <https://developers.cloudflare.com/durable-objects/llms.txt>

### Named Instances

Use `idFromName("some-name")` for a deterministic, stable DO instance ID. All callers using the same name are guaranteed to reach the same instance:

```typescript
const stub = namespace.get(namespace.idFromName("event-cancellation"));
```

### Alarm API

Each DO instance supports at most **one alarm** at a time. Calling `setAlarm()` overwrites any prior alarm — there is no queue. Call `deleteAlarm()` to cancel a pending alarm.

```typescript
await this.ctx.storage.setAlarm(expirationTimeMs);
await this.ctx.storage.deleteAlarm();
```

### Self-Call Deadlock Warning

**Do not call a DO stub method from within that same DO's `alarm()` handler.** The DO processes one task at a time. While `alarm()` is running, any incoming RPC call is queued — it will not execute until `alarm()` finishes. If `alarm()` awaits that RPC, it deadlocks.

Instead, call data sources directly inside `alarm()` to perform DB operations without going through the DO stub:

```typescript
// WRONG — deadlocks if called from alarm()
const stub = namespace.get(namespace.idFromName("event-cancellation"));
await stub.cancelExpiration(); // this RPC waits for alarm() to finish → deadlock

// CORRECT — call the data source directly
await this.activeJobsDataSource.deletePendingEventCancellationExpirationJobs();
```
