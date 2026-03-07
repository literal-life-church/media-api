import { ValidateAuthorizationUseCase } from "./domain/usecase/ValidateAuthorizationUseCase";

export const AuthMiddleware = async (context, next) => {
    const body = await context.req.raw.clone().json(); // Clone the request to avoid consuming the body stream, allowing downstream handlers to read it as well
    const headers = context.req.header();

    await new ValidateAuthorizationUseCase().execute(headers, body);
    await next();
};
