import { ValidateAuthorizationUseCase } from "./domain/usecase/ValidateAuthorizationUseCase";

export const AuthMiddleware = async (context, next) => {
    const body = await context.req.json();
    const headers = context.req.header();

    await new ValidateAuthorizationUseCase().execute(headers, body);
    await next();
};
