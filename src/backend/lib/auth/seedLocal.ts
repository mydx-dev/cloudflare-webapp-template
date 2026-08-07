import { eq } from 'drizzle-orm';
import type { AuthRole } from '../../../shared/auth/accessControl';
import { user } from '../../infrastructure/db/authSchema';
import { db } from '../../infrastructure/db/database';
import { auth } from './auth';

const LOCAL_PASSWORD = 'Password123!';

const localUsers = [
    {
        name: 'Local Admin',
        email: 'admin@example.com',
        role: 'admin',
    },
    {
        name: 'Local Manager',
        email: 'manager@example.com',
        role: 'manager',
    },
    {
        name: 'Local User',
        email: 'user@example.com',
        role: 'user',
    },
] as const satisfies ReadonlyArray<{
    name: string;
    email: string;
    role: AuthRole;
}>;

export const seedLocal = async () => {
    for (const localUser of localUsers) {
        const existingUser = await db.query.user.findFirst({
            where: eq(user.email, localUser.email),
        });

        if (existingUser) {
            console.log(`[seed] skip: ${localUser.email}`);
            continue;
        }

        await auth.api.createUser({
            body: {
                name: localUser.name,
                email: localUser.email,
                password: LOCAL_PASSWORD,
                role: localUser.role,
            },
        });

        console.log(`[seed] created: ${localUser.email} (${localUser.role})`);
    }
};
