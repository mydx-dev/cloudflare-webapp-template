import { Auth } from '../../lib/auth/auth';

export class BanUserUseCase {
    constructor(private readonly auth: Auth) {}

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
