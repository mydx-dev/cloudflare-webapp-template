import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../../types/app-env';

export const unauthorizedErrorResponse = (
    c: Parameters<MiddlewareHandler<AppEnv>>[0]
) => {
    return c.json(
        {
            code: 'UNAUTHORIZED' as const,
            message: 'You are not authorized to access this resource.',
        },
        401
    );
};
