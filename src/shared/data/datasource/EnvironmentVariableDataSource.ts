export function EnvironmentVariableDataSource(key: string): string | undefined {
    return process.env[key];
}
