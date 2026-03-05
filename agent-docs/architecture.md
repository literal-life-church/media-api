# Architecture

This project uses a form of the clean architecture. In general, since this is a backend project, there is a bit of liberty given to what a view layer concern is vs a business layer concern.

Here is how everything is defined:

- **View layer:** this would be considered a Hono route. In general, it is the thing in the project that receives or generates JSON. Since JSON is the "view" of our API, that is how the delineation is defined.
- **Business layer:** these layers all reside at a lower level than the view layer and are often imported into the view layer by its top-level `UseCase` classes.

## Business Sub-Layers

The business layer consists of two major sub-layers:

- **Data:** lower-level data modeling that is specific to an API, SDK, runtime, or external vendor. Data living here is not necessarily optimized for our problem-set but is needed to interact with these third-party tools.
- **Domain:** high-level data modeling that is specifically designed for our problem-set. This includes API contracts, since we design this interface and is not necessarily reliant on third-party tooling.

## Models

We have two types of models in this architecture:

- **DataModel:** Lives within the Data layer to model third-party data. Located in `<feature>/data/model` where the file and class name always end in `DataModel`.
- **DomainModel:** Lives within the Domain layer to model problems solved by our first-party application and its current problem set. Located in `<feature>/domain/model` where the file and class name always end in `DomainModel`.

## Hierarchy

With the prior information firmly established, here is a bottom-up view of our Business layer:

- **DataModel**: Previously described. Lowest-level component in this stack.
- **DataSource:** These classes directly integrate with an SDK and use their API-specific technology. For example, this would be where we would use the NodeJS API to extract an environment variable or a networking library to make the actual network call. Should we ever need to move runtimes or SDKs in the future, this is the only layer which should need to be changed. Located in `<feature>/data/datasource` where the file and class name always end in `DataSource`.
- **Mapper:** In cases where we need to transform data from a `DataModel` to a `DomainModel`, this is the place to do it. Most cases are going to be a 1-to-1 mapping. In that case, extend `GenericMapper<Input, Output>` and implement the `map(payload: Input): Output` function. Located in `<feature>/data/mapper` where the file and class name always end in `Mapper`.
- **Repository:** Used as the top-most component in our Data layer. Often used to fetch information from a `DataSource` and map it from a `DataModel` to a `DomainModel`. Located in `<feature>/data/repository` where the file and class name always end in `Repository`.

Now we leave the data layer and move to the domain layer.

- **DomainModel:** Previously described.
- **UseCase:** This is the location where core business logic goes, after all data has been retrieved and mapped (like from a `Repository` that returns a `DomainModel`). Each use case is designed to answer 1 high-level problem within this domain, such as creating a resource in our database. Deleting the same resource would be a separate UseCase. Located in `<feature>/domain/usecase` where the file and class name always end in `UseCase`. Each UseCase includes an `execute()` function.

## Flow

You can see how the flow goes from bottom up:

    DataSource -> Repository (which might call Mapper if the DataSource returns a DataModel instead of a DomainModel) -> UseCase

In cases where having a `DataModel` would result in the exact same schema as a `DomainModel`, skip creating a `DataModel` and just use the `DomainModel`. This is likely an indicator that we are not calling any third-party SDKs, APIs, or runtimes as part of this flow.

In cases where something would be redundant, such as a `Repository` that doesn't need to map anything, it would just call the `DataSource` on our behalf, skip creating these pass-through classes. Each class should have meaning, and not be a strict adherence to a pattern.

So, it might be completely valid to do this:

    DataSource (which returns a DomainModel) -> UseCase
