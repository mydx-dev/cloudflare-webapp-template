import { eq } from 'drizzle-orm';
import { invitationTable } from '../../infrastructure/db/appSchema';
import { Database } from '../../infrastructure/db/database';
import { DomainMap } from '../../infrastructure/domainMap/DomainMap';

export class ListInvitationUseCase {
    constructor(
        private readonly db: Database,
        private readonly dm: DomainMap
    ) {}

    async execute(inviterId: string) {
        const records = await this.db
            .select()
            .from(invitationTable)
            .where(eq(invitationTable.inviterId, inviterId))
            .all();
        const invitations = records.map((record) =>
            this.dm.invitation.toDomain(record)
        );
        return invitations.map((invitation) => ({
            id: invitation.id,
            inviterId: invitation.inviter.id,
            email: invitation.invitee.value,
            status: invitation.status.value,
            role: invitation.role.value,
            createdAt: invitation.createdAt,
            expiredAt: invitation.expiration.value,
            acceptedAt: invitation.acceptedAt,
            revokedAt: invitation.revokedAt,
        }));
    }
}
