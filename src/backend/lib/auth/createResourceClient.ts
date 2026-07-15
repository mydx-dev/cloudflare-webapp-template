import { oauthProviderResourceClient } from '@better-auth/oauth-provider/resource-client';
import { createAuthClient } from 'better-auth/client';
import { createAuth } from './createAuth';

export const createResourceClient = (env: Env, baseURL: string) => {
    const auth = createAuth(env, baseURL);

    return createAuthClient({
        baseURL,
        plugins: [oauthProviderResourceClient(auth)],
    });
};
