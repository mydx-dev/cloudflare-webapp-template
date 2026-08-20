import { eq } from 'drizzle-orm';
import type { Invitation } from '../../domain/invitation/Invitation';
import type { InvitationToken } from '../../domain/invitation/InvitationToken';
import { invitationTable } from '../db/appSchema';
import { Database } from '../db/database';
import { DomainMap } from '../domainMap/DomainMap';

export class InvitationRepository {
    constructor(
        private readonly db: Database,
        private readonly dm: DomainMap
    ) {}
    async findById(invitationId: string) {
        const record = await this.db
            .select()
            .from(invitationTable)
            .where(eq(invitationTable.id, invitationId))
            .get();

        if (!record) {
            return null;
        }

        return this.dm.invitation.toDomain(record);
    }

    async findByToken(token: InvitationToken) {
        const hashedToken = token.hashed ? token : await token.hash();
        const record = await this.db
            .select()
            .from(invitationTable)
            .where(eq(invitationTable.token, hashedToken.value))
            .get();

        if (!record) {
            return null;
        }

        return this.dm.invitation.toDomain(record);
    }

    async save(invitation: Invitation) {
        const record = this.dm.invitation.toRecord(invitation);
        if (!invitation.token.hashed) {
            record.token = (await invitation.token.hash()).value;
        }
        await this.db
            .insert(invitationTable)
            .values(record)
            .onConflictDoUpdate({
                target: invitationTable.id,
                set: record,
            })
            .run();
    }
}
