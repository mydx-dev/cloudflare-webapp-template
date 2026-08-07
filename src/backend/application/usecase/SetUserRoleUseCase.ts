import type { AuthRole } from '../../../shared/auth/accessControl';
import { Auth } from '../../lib/auth/auth';

export class SetUserRoleUseCase {
    constructor(private readonly auth: Auth) {}

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
