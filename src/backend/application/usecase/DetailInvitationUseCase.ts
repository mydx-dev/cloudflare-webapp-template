import { eq } from 'drizzle-orm';
import { InvitationNotFoundError } from '../../domain/invitation/Invitation.errors';
import { invitationTable } from '../../infrastructure/db/appSchema';
import { Database } from '../../infrastructure/db/database';

export class DetailInvitationUseCase {
    constructor(private readonly db: Database) {}

    async execute(invitationId: string) {
        const invitation = await this.db
            .select()
            .from(invitationTable)
            .where(eq(invitationTable.id, invitationId))
            .get();

        if (!invitation) {
            throw new InvitationNotFoundError();
        }

        return {
            id: invitation.id,
            inviterId: invitation.inviterId,
            email: invitation.email,
            status: invitation.status,
            role: invitation.role,
            createdAt: invitation.createdAt,
            expiredAt: invitation.expiredAt,
            acceptedAt: invitation.acceptedAt,
            revokedAt: invitation.revokedAt,
        };
    }
}
