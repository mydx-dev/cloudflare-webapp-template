import { inferdiHono } from '@inferdi/hono';
import { drizzle } from 'drizzle-orm/d1';
import type { MiddlewareHandler } from 'hono';
import * as authSchema from '../../infrastructure/db/authSchema';
import { createAuth } from '../../lib/auth/createAuth';
import { container } from '../../lib/di/container';
import type { AppEnv } from '../../types/app-env';

export const diMiddleware: MiddlewareHandler<AppEnv> = inferdiHono<
    typeof container,
    AppEnv
>({
    container,

    setupScope: (scope, c) => {
        const db = drizzle(c.env.DB, {
            schema: authSchema,
        });

        scope.override('db', db);

        const auth = createAuth(c.env, new URL(c.req.url).origin);

        scope.override('auth', auth);
    },
});
