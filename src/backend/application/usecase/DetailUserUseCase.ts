import { createAuth } from '../../lib/auth/createAuth';

export class DetailUserUseCase {
    constructor(private readonly auth: ReturnType<typeof createAuth>) {}

    async execute(input: { headers: Headers; userId: string }) {
        const [user, sessions] = await Promise.all([
            this.auth.api.getUser({
                headers: input.headers,
                query: { id: input.userId },
            }),
            this.auth.api.listUserSessions({
                headers: input.headers,
                body: { userId: input.userId },
            }),
        ]);

        return {
            user,
            sessions: sessions.sessions,
        };
    }
}
