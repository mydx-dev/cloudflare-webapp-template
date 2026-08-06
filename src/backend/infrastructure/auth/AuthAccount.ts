import type { AuthRole } from '../../../shared/auth/accessControl';

export interface AuthAccountContext {
    password: {
        hash(password: string): Promise<string>;
    };

    internalAdapter: {
        createUser(input: {
            email: string;
            name: string;
            emailVerified: boolean;
            role: AuthRole;
        }): Promise<{
            id: string;
            email: string;
            name: string;
            role?: string | null;
        }>;

        linkAccount(input: {
            userId: string;
            accountId: string;
            providerId: string;
            password: string;
        }): Promise<unknown>;
    };
}
export class AuthAccount {
    constructor(
        private readonly auth: { $context: Promise<AuthAccountContext> }
    ) {}

    async create({
        email,
        name,
        password,
        role,
    }: {
        email: string;
        name: string;
        password: string;
        role: AuthRole;
    }) {
        const context = await this.auth.$context;

        const passwordHash = await context.password.hash(password);

        const user = await context.internalAdapter.createUser({
            email,
            name,
            emailVerified: true,
            role,
        });

        await context.internalAdapter.linkAccount({
            userId: user.id,
            accountId: user.id,
            providerId: 'credential',
            password: passwordHash,
        });

        return user;
    }
}
