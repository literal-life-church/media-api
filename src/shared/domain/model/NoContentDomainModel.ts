export function NoContentDomainModelSchema(description: string) {
    return {
        "204": {
            description,
        },
    };
}
