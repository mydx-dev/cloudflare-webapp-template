import { Auth } from '../../lib/auth/auth';

export class UnbanUserUseCase {
    constructor(private readonly auth: Auth) {}

    async execute(input: { headers: Headers; userId: string }) {
        return this.auth.api.unbanUser({
            headers: input.headers,
            body: {
                userId: input.userId,
            },
        });
    }
}
