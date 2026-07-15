import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { oauthProvider } from '@better-auth/oauth-provider';
import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import * as authSchema from '../../infrastructure/db/authSchema';

export const createAuth = (env: Env, baseURL: string) => {
    const db = drizzle(env.DB, {
        schema: authSchema,
    });

    return betterAuth({
        baseURL,
        basePath: '/api/auth',

        database: drizzleAdapter(db, {
            provider: 'sqlite',
            schema: authSchema,
        }),

        emailAndPassword: {
            enabled: true,
        },

        plugins: [
            jwt(),
            oauthProvider({
                loginPage: '/sign-in',
                consentPage: '/consent',
                allowDynamicClientRegistration: true,
                allowUnauthenticatedClientRegistration: true,
                validAudiences: [`${baseURL}/mcp`],
            }),
        ],
    });
};
