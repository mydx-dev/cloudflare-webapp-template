import { InferdiHonoEnv } from '@inferdi/hono';
import { container } from '../lib/di/container';

export type AppEnv = { Bindings: Env } & InferdiHonoEnv<typeof container>;
