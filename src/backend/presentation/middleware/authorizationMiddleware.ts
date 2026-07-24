import type { MiddlewareHandler } from 'hono';
import type { AuthPermission } from '../../../shared/auth/accessControl';
import { createAuth } from '../../lib/auth/createAuth';
import { unauthorizedResponse } from '../response/unauthorizedResponse';

type AppEnv = {
    Bindings: Env;
};

export const authorizationMiddleware = (
    permissions: AuthPermission
): MiddlewareHandler<AppEnv> => {
    return async (c, next) => {
        const auth = createAuth(c.env, new URL(c.req.url).origin);
        const session = await auth.api.getSession({
            headers: c.req.raw.headers,
        });

        if (!session) {
            return unauthorizedResponse(c);
        }

        const result = await auth.api.userHasPermission({
            headers: c.req.raw.headers,
            body: {
                permissions,
            },
        });

        if (!result.success) {
            return c.json(
                {
                    message: 'Forbidden',
                },
                403
            );
        }

        await next();
    };
};
