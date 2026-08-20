import { MiddlewareHandler } from 'hono';
import { AppEnv } from '../../types/app-env';

export const internalServerErrorResponse = (
    c: Parameters<MiddlewareHandler<AppEnv>>[0]
) => {
    return c.json(
        {
            code: 'INTERNAL_SERVER_ERROR' as const,
            message: 'Internal server error.',
        },
        500
    );
};
