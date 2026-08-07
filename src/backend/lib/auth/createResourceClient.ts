import { oauthProviderResourceClient } from '@better-auth/oauth-provider/resource-client';
import { createAuthClient } from 'better-auth/client';
import { auth } from './auth';

export const createResourceClient = (env: Env, baseURL: string) => {
    return createAuthClient({
        baseURL,
        plugins: [oauthProviderResourceClient(auth)],
    });
};
