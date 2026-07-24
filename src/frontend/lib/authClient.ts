import { oauthProviderClient } from '@better-auth/oauth-provider/client';
import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import {
    authAccessControl,
    authAccessRoles,
} from '../../shared/auth/accessControl';

export const authClient = createAuthClient({
    baseURL: window.location.origin,
    plugins: [
        adminClient({
            ac: authAccessControl,
            roles: authAccessRoles,
        }),
        oauthProviderClient(),
    ],
});
