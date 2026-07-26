import { createAuth } from '../../lib/auth/createAuth';

export class DeleteUserUseCase {
    constructor(private readonly auth: ReturnType<typeof createAuth>) {}

    async execute(input: { headers: Headers; userId: string }) {
        return this.auth.api.removeUser({
            headers: input.headers,
            body: {
                userId: input.userId,
            },
        });
    }
}
