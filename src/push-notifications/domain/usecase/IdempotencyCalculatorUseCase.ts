import { v5 } from "uuid";

export class IdempotencyCalculatorUseCase {
    execute(payload: object): string {
        return v5(JSON.stringify(payload), v5.URL);
    }
}
