import { createAuth } from '../../lib/auth/createAuth';

export class UnbanUserUseCase {
    constructor(private readonly auth: ReturnType<typeof createAuth>) {}

    async execute(input: { headers: Headers; userId: string }) {
        return this.auth.api.unbanUser({
            headers: input.headers,
            body: {
                userId: input.userId,
            },
        });
    }
}
