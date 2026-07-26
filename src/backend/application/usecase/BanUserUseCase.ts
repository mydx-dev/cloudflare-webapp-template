import { createAuth } from '../../lib/auth/createAuth';

export class BanUserUseCase {
    constructor(private readonly auth: ReturnType<typeof createAuth>) {}

    async execute(input: {
        banExpiresIn?: number;
        banReason?: string;
        headers: Headers;
        userId: string;
    }) {
        return this.auth.api.banUser({
            headers: input.headers,
            body: {
                banExpiresIn: input.banExpiresIn,
                banReason: input.banReason,
                userId: input.userId,
            },
        });
    }
}
