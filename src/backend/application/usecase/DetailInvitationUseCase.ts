import { eq } from 'drizzle-orm';
import {
    InvitationNotFoundError,
    InviterMismatchError,
} from '../../domain/invitation/Invitation.errors';
import { invitationTable } from '../../infrastructure/db/appSchema';
import { Database } from '../../infrastructure/db/database';
import { DomainMap } from '../../infrastructure/domainMap/DomainMap';
import { ApplicationError } from '../dto/ApplicationError';
import { UseCase } from './UseCase';

export class DetailInvitationUseCase implements UseCase {
    private static readonly errors = [
        InvitationNotFoundError,
        InviterMismatchError,
    ] as const;
    public readonly errorCodes = ApplicationError.codes(
        DetailInvitationUseCase.errors
    );

    constructor(
        private readonly db: Database,
        private readonly dm: DomainMap
    ) {}

    async execute(invitationId: string, inviterId: string) {
        try {
            const invitation = await this.db
                .select()
                .from(invitationTable)
                .where(eq(invitationTable.id, invitationId))
                .get();

            if (!invitation) {
                throw new InvitationNotFoundError();
            }

            const invitationDomain = this.dm.invitation.toDomain(invitation);
            invitationDomain.inviter.ensureSameAs(inviterId);

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
        } catch (error) {
            throw new ApplicationError(error, DetailInvitationUseCase.errors);
        }
    }
}
