import type { MiddlewareHandler } from 'hono';

type AppEnv = {
    Bindings: Env;
};

export const unauthorizedResponse = (
    c: Parameters<MiddlewareHandler<AppEnv>>[0]
) => {
    return c.json(
        {
            message: 'Unauthorized',
        },
        401
    );
};
