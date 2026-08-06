import type { AuthRole } from '../../../shared/auth/accessControl';
import { EmailAddress } from '../../domain/shared/EmailAddress';
import { User } from '../../domain/user/User';
import { user } from '../db/authSchema';
import { DomainTranslation } from './DomainTranslation';

type UserRecord = typeof user.$inferInsert;

export const userMap = new DomainTranslation<User, UserRecord>(
    (domain: User) => ({
        id: domain.id,
        name: domain.name,
        email: domain.email.value,
        role: domain.role,
        banned: domain.isBanned,
    }),
    (record: UserRecord) =>
        new User({
            id: record.id,
            name: record.name,
            email: new EmailAddress(record.email),
            role: record.role as AuthRole,
            isBanned: record.banned ?? false,
        })
);
