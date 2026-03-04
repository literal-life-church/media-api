import { createMiddleware } from "hono/factory";
import { ValidateAuthorizationUseCase } from "./domain/usecase/ValidateAuthorizationUseCase";

const AuthMiddleware = createMiddleware(async (context, next) => {
    const body = await context.req.json();
    const headers = context.req.header();

    await new ValidateAuthorizationUseCase().execute(headers, body);
    await next();
});
