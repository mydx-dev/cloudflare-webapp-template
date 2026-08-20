import { createMiddleware } from 'hono/factory';
import type { AuthPermission } from '../../../shared/auth/accessControl';
import { AppEnv } from '../../types/app-env';
import { forbiddenErrorResponse } from '../http/forbiddenErrorResponse';

export const authorizationMiddleware = (permissions: AuthPermission) =>
    createMiddleware<AppEnv>(async (c, next) => {
        const auth = c.var.di.get('auth');
        const result = await auth.api.userHasPermission({
            headers: c.req.raw.headers,
            body: {
                permissions,
            },
        });

        if (!result.success) {
            return forbiddenErrorResponse(c);
        }

        await next();
    });
