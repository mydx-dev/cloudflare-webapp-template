import type { AuthRole } from '../../../shared/auth/accessControl';
import { createAuth } from '../../lib/auth/createAuth';

export class SetUserRoleUseCase {
    constructor(private readonly auth: ReturnType<typeof createAuth>) {}

    async execute(input: { headers: Headers; role: AuthRole; userId: string }) {
        return this.auth.api.setRole({
            headers: input.headers,
            body: {
                role: input.role,
                userId: input.userId,
            },
        });
    }
}
