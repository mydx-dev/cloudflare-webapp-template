import { inferdiHono } from '@inferdi/hono';
import type { MiddlewareHandler } from 'hono';
import { container } from '../../lib/di/container';
import type { AppEnv } from '../../types/app-env';

export const diMiddleware: MiddlewareHandler<AppEnv> = inferdiHono<
    typeof container,
    AppEnv
>({
    container,
});
