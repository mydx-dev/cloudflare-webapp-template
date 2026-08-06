import { Auth } from '../../lib/auth/auth';

export class RevokeUserSessionUseCase {
    constructor(private readonly auth: Auth) {}

    async execute(input: { headers: Headers; sessionToken: string }) {
        return this.auth.api.revokeUserSession({
            headers: input.headers,
            body: {
                sessionToken: input.sessionToken,
            },
        });
    }
}
