import { createAuth } from '../../lib/auth/createAuth';

export class RevokeUserSessionUseCase {
    constructor(private readonly auth: ReturnType<typeof createAuth>) {}

    async execute(input: { headers: Headers; sessionToken: string }) {
        return this.auth.api.revokeUserSession({
            headers: input.headers,
            body: {
                sessionToken: input.sessionToken,
            },
        });
    }
}
