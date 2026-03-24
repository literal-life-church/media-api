# Architecture

This project uses a form of clean architecture. Since this is a backend project, there is some latitude in how view-layer vs. business-layer concerns are defined.

Here is how everything is defined:

- **View layer:** a Controller — a Hono route that extends `OpenAPIRoute` from Chanfana. Files end in `*Controller.ts`. It is the thing in the project that receives or generates JSON. Since JSON is the "view" of our API, that is how the delineation is defined.
- **Business layer:** these layers all reside at a lower level than the view layer and are often imported by the top-level `UseCase` classes.

## Controllers and Domain-Level Controllers

There are two kinds of controllers in this project:

- **Route controllers** (`*Controller.ts`) — HTTP-triggered. Registered in `src/index.ts` via `openapi.get()`, `openapi.post()`, etc.
- **Durable Object controllers** (e.g., `EventCancellationExpirationJobDurableObject.ts`) — CF runtime-triggered via an alarm, not via an HTTP route. They live at the top level of a feature module, follow the same architectural tier as route controllers, and are exported from `src/index.ts` so the CF runtime can locate them.

## Constructor Injection

All dependencies use constructor injection with default parameter values, making them testable without a DI framework:

```typescript
// Use case with injectable data source
constructor(
    d1: D1Database,
    private readonly dataSource: MyDataSource = new MyDataSource(d1)
) { }

// Controller with injectable dependency (uses RouteOptions, not D1Database)
constructor(
    params: RouteOptions,
    private readonly mapper: MyMapper = new MyMapper()
) {
    super(params);
}
```

## Business Sub-Layers

The business layer consists of two major sub-layers:

- **Data:** lower-level data modeling specific to an API, SDK, runtime, or external vendor. Data here is not necessarily optimized for our problem set but is needed to interact with third-party tools.
- **Domain:** high-level data modeling specifically designed for our problem set. This includes API contracts since we design this interface and it is not necessarily reliant on third-party tooling.

## Models

We have two types of models in this architecture:

- **DataModel:** Lives within the Data layer to model third-party data. Located in `<feature>/data/model` where the file and class name always end in `DataModel`.
- **DomainModel:** Lives within the Domain layer to model problems solved by our first-party application. Located in `<feature>/domain/model` where the file and class name always end in `DomainModel`.

## Hierarchy

With the prior information established, here is a bottom-up view of our Business layer:

- **DataModel:** Previously described. Lowest-level component in this stack.
- **DataSource:** These classes directly integrate with an SDK and use their API-specific technology. For example, this is where we use the Drizzle ORM to query D1, or `process.env` to read an environment variable. Should we ever need to move runtimes or SDKs in the future, this is the only layer that should need to change. Located in `<feature>/data/datasource` where the file and class name always end in `DataSource`.
- **Mapper:** In cases where we need to transform data from a `DataModel` to a `DomainModel`, this is the place to do it. Located in `<feature>/data/mapper` where the file and class name always end in `Mapper`.
  - For **single-input** mappings, extend `GenericMapper<Input, Output>` from `src/shared/data/mapper/GenericMapper.ts` and implement `map(payload: Input): Output`.
  - For **multi-input** mappings (e.g., separate `name`, `reason`, `timeOfEvent` parameters), do NOT use `GenericMapper<>`. Instead, define a mapper class with an explicit `map(param1, param2, ...)` signature using named parameters.
- **Repository:** Used as the top-most component in our Data layer. Often used to fetch information from a `DataSource` and map it from a `DataModel` to a `DomainModel`. Located in `<feature>/data/repository` where the file and class name always end in `Repository`.

Now we leave the data layer and move to the domain layer:

- **DomainModel:** Previously described.
- **UseCase:** This is where core business logic lives, after all data has been retrieved and mapped. Each use case answers one high-level problem within this domain. Deleting vs. creating the same resource are separate use cases. Located in `<feature>/domain/usecase` where the file and class name always end in `UseCase`. Each UseCase exposes an `execute()` method.

## Flow

```text
DataSource → Repository (calls Mapper if DataSource returns a DataModel) → UseCase
```

## Pragmatic Guidance

In cases where having a `DataModel` would result in the exact same schema as a `DomainModel`, skip the `DataModel` and use the `DomainModel` directly. This is likely an indicator that no third-party SDKs are involved.

In cases where a `Repository` would just proxy straight to a `DataSource` without mapping, skip the `Repository`. Each class should have meaning. A valid minimal flow is:

```text
DataSource (returns a DomainModel directly) → UseCase
```

This is the pattern used throughout this project — there are no `Repository` classes in the current codebase.
