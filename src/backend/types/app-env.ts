import { InferdiHonoEnv } from '@inferdi/hono';
import type { Auth } from '../lib/auth/auth';
import { container } from '../lib/di/container';

type AuthSession = Auth['$Infer']['Session'];

type AuthVariables = {
    user: AuthSession['user'];
    session: AuthSession['session'];
};

export type AppEnv = {
    Bindings: Env;
    Variables: AuthVariables;
} & InferdiHonoEnv<typeof container>;
