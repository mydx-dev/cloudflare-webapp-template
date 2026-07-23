import { InferdiHonoEnv, inferdiHono } from '@inferdi/hono';
import { drizzle } from 'drizzle-orm/d1';
import { MiddlewareHandler } from 'hono';
import * as authSchema from '../../infrastructure/db/authSchema';
import { createContainer } from '../../lib/di/createContainer';

const container = createContainer();
type AppEnv = { Bindings: Env } & InferdiHonoEnv<typeof container>;

export const diMiddleware: MiddlewareHandler<AppEnv> = inferdiHono<
    typeof container,
    AppEnv
>({
    container,
    setupScope: (scope, c) => {
        const db = drizzle(c.env.DB, {
            schema: authSchema,
        });
        scope.registerValue('db', db);
    },
});
