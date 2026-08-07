import type { UserWithRole } from 'better-auth/plugins/admin';
import { and, eq } from 'drizzle-orm';
import type { AuthRole } from '../../../shared/auth/accessControl';
import type { Auth } from '../../lib/auth/auth';
import { account, user } from '../db/authSchema';
import type { Database } from '../db/database';

export interface AuthAccountContext {
    api: Pick<Auth['api'], 'createUser'>;
}

type AuthUser = {
    id: string;
    email: string;
    name: string;
    role: string | null;
};

type AuthIdentity =
    | {
          status: 'missing';
      }
    | {
          status: 'incomplete';
          user: AuthUser;
      }
    | {
          status: 'complete';
          user: AuthUser;
      };

type EnsureAuthAccountInput = {
    email: string;
    name: string;
    password: string;
    role: AuthRole;
};

export class IncompleteAuthIdentityError extends Error {
    constructor(public readonly userId: string) {
        super(`Incomplete auth identity for user ${userId}`);
        this.name = 'IncompleteAuthIdentityError';
    }
}

export class AuthAccount {
    constructor(
        private readonly db: Database,
        private readonly auth: AuthAccountContext
    ) {}

    async inspect(email: string): Promise<AuthIdentity> {
        const [result] = await this.db
            .select({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                accountId: account.id,
            })
            .from(user)
            .leftJoin(
                account,
                and(
                    eq(account.userId, user.id),
                    eq(account.providerId, 'credential')
                )
            )
            .where(eq(user.email, email))
            .limit(1);

        if (!result) {
            return {
                status: 'missing',
            };
        }

        if (!result.accountId) {
            return {
                status: 'incomplete',
                user: result.user,
            };
        }

        return {
            status: 'complete',
            user: result.user,
        };
    }

    async create(input: EnsureAuthAccountInput): Promise<UserWithRole> {
        const result = await this.auth.api.createUser({
            body: input,
        });
        return result.user;
    }

    async ensure(
        input: EnsureAuthAccountInput
    ): Promise<AuthUser | UserWithRole> {
        const identity = await this.inspect(input.email);

        if (identity.status === 'complete') {
            return identity.user;
        }

        if (identity.status === 'incomplete') {
            throw new IncompleteAuthIdentityError(identity.user.id);
        }

        try {
            return await this.create(input);
        } catch (error) {
            const retriedIdentity = await this.inspect(input.email);

            if (retriedIdentity.status === 'complete') {
                return retriedIdentity.user;
            }

            throw error;
        }
    }
}
