import type { MiddlewareHandler } from 'hono';
import type { AuthPermission } from '../../../shared/auth/accessControl';
import { AppEnv } from '../../types/app-env';

export const authorizationMiddleware = (
    permissions: AuthPermission
): MiddlewareHandler<AppEnv> => {
    return async (c, next) => {
        const auth = c.var.di.get('auth');
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
