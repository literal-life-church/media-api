import { Context, Next } from "hono";

import { ValidateAuthorizationUseCase } from "./domain/usecase/ValidateAuthorizationUseCase";

export const AuthMiddleware = async (context: Context, next: Next) => {
    const body = await context.req.raw.clone().json() as object; // Clone the request to avoid consuming the body stream, allowing downstream handlers to read it as well
    const headers = context.req.header();

    await new ValidateAuthorizationUseCase().execute(headers, body);
    await next();
};
