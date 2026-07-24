import type { MiddlewareHandler } from 'hono';
import { createAuth } from '../../lib/auth/createAuth';
import { unauthorizedResponse } from '../response/unauthorizedResponse';

type AppEnv = {
    Bindings: Env;
};

export const authenticationMiddleware: MiddlewareHandler<AppEnv> = async (
    c,
    next
) => {
    const auth = createAuth(c.env, new URL(c.req.url).origin);
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session) {
        return unauthorizedResponse(c);
    }

    await next();
};
