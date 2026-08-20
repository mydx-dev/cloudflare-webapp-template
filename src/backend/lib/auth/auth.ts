import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { oauthProvider } from '@better-auth/oauth-provider';
import { betterAuth } from 'better-auth';
import { admin, jwt } from 'better-auth/plugins';
import { env } from 'cloudflare:workers';
import {
    authAccessControl,
    authAccessRoles,
} from '../../../shared/auth/accessControl';
import * as authSchema from '../../infrastructure/db/authSchema';
import { db } from '../../infrastructure/db/database';
import { sendPasswordResetEmail } from './passwordResetEmail';

const baseURL = new URL(env.BETTER_AUTH_URL).origin;
const isSignUpEnabled = String(env.SIGN_UP_ENABLED) === 'true';

export const auth = betterAuth({
    baseURL,
    basePath: '/api/auth',

    database: drizzleAdapter(db, {
        provider: 'sqlite',
        schema: authSchema,
    }),

    emailAndPassword: {
        enabled: true,
        disableSignUp: !isSignUpEnabled,
        minPasswordLength: 8,
        maxPasswordLength: 128,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
            await sendPasswordResetEmail(env.EMAIL, {
                from: env.PASSWORD_RESET_EMAIL_FROM,
                user,
                url,
            });
        },
    },

    plugins: [
        admin({
            ac: authAccessControl,
            roles: authAccessRoles,
            defaultRole: 'user',
            adminRoles: ['admin'],
        }),
        jwt(),
        oauthProvider({
            loginPage: '/sign-in',
            consentPage: '/consent',
            allowDynamicClientRegistration: true,
            allowUnauthenticatedClientRegistration: true,
            validAudiences: [`${baseURL}/mcp`],
        }),
    ],
    trustedOrigins: env.TRUSTED_ORIGINS.split(','),
});

export type Auth = typeof auth;
