import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as appSchema from './appSchema';
import * as authSchema from './authSchema';

export const schema = {
    ...appSchema,
    ...authSchema,
};

export const db = drizzle(env.DB, { schema });
export type Database = typeof db;
