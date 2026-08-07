import { Invitation } from '../../domain/invitation/Invitation';
import { InvitationExpiration } from '../../domain/invitation/InvitationExpiration';
import { InvitationRole } from '../../domain/invitation/InvitationRole';
import { InvitationStatus } from '../../domain/invitation/InvitationStatus';
import { InvitationToken } from '../../domain/invitation/InvitationToken';
import { Inviter } from '../../domain/invitation/Inviter';
import { EmailAddress } from '../../domain/shared/EmailAddress';
import { invitationTable } from '../db/appSchema';
import { DomainTranslation } from './DomainTranslation';

export const invitationMap = new DomainTranslation<
    Invitation,
    typeof invitationTable.$inferInsert
>(
    (domain: Invitation) => ({
        id: domain.id,
        inviterId: domain.inviter.id,
        email: domain.invitee.value,
        role: domain.role.value,
        token: domain.token.value,
        status: domain.status.value,
        expiredAt: domain.expiration.value,
        createdAt: domain.createdAt,
        acceptedAt: domain.acceptedAt ?? null,
        revokedAt: domain.revokedAt ?? null,
    }),
    (record: typeof invitationTable.$inferInsert) =>
        new Invitation({
            id: record.id,
            inviter: new Inviter(record.inviterId),
            invitee: new EmailAddress(record.email),
            role: new InvitationRole(record.role),
            token: new InvitationToken(record.token, true),
            status: new InvitationStatus(record.status),
            expiration: new InvitationExpiration(record.expiredAt),
            createdAt: record.createdAt,
            acceptedAt: record.acceptedAt ?? null,
            revokedAt: record.revokedAt ?? null,
        })
);
