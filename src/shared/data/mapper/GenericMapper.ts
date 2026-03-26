export interface GenericMapper<Input, Output> {
    map(payload: Input): Output;
}
