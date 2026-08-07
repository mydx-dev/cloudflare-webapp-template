import { APIError } from 'better-auth';
import { UserNotFoundError } from '../../domain/user/User.errors';
import type { Auth } from '../../lib/auth/auth';

export class DetailUserUseCase {
    constructor(private readonly auth: Auth) {}

    async execute(input: { headers: Headers; userId: string }) {
        try {
            const user = await this.auth.api.getUser({
                headers: input.headers,
                query: { id: input.userId },
            });
            const sessions = await this.auth.api.listUserSessions({
                headers: input.headers,
                body: { userId: input.userId },
            });
            return {
                user,
                sessions: sessions.sessions,
            };
        } catch (error) {
            if (error instanceof APIError && error.status === 'NOT_FOUND') {
                throw new UserNotFoundError();
            }
            throw error;
        }
    }
}
