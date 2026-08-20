import type { MiddlewareHandler } from 'hono';
import type { AppEnv } from '../../types/app-env';

export const forbiddenErrorResponse = (
    c: Parameters<MiddlewareHandler<AppEnv>>[0]
) => {
    return c.json(
        {
            code: 'FORBIDDEN' as const,
            message: 'You do not have permission to access this resource.',
        },
        403
    );
};
