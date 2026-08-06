import { Auth } from '../../lib/auth/auth';

export class DeleteUserUseCase {
    constructor(private readonly auth: Auth) {}

    async execute(input: { headers: Headers; userId: string }) {
        return this.auth.api.removeUser({
            headers: input.headers,
            body: {
                userId: input.userId,
            },
        });
    }
}
