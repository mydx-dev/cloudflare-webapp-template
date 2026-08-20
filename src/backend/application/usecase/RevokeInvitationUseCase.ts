import {
    InvitationAlreadyAcceptedError,
    InvitationExpiredError,
    InvitationNotFoundError,
    InvitationRevokedError,
    InviterMismatchError,
} from '../../domain/invitation/Invitation.errors';
import { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { ApplicationError } from '../dto/ApplicationError';
import { UseCase } from './UseCase';

export class RevokeInvitationUseCase implements UseCase {
    private static readonly errors = [
        InvitationExpiredError,
        InvitationAlreadyAcceptedError,
        InvitationRevokedError,
        InviterMismatchError,
        InvitationNotFoundError,
    ] as const;
    public readonly errorCodes = ApplicationError.codes(
        RevokeInvitationUseCase.errors
    );
    constructor(private readonly invitationRepository: InvitationRepository) {}

    async execute(invitationId: string, inviterId: string) {
        try {
            const invitation =
                await this.invitationRepository.findById(invitationId);
            if (!invitation) {
                throw new InvitationNotFoundError();
            }
            const revokedInvitation = invitation.revoke(inviterId);

            await this.invitationRepository.save(revokedInvitation);
            return {
                id: revokedInvitation.id,
                inviterId: revokedInvitation.inviter.id,
                email: revokedInvitation.invitee.value,
                status: revokedInvitation.status.value,
                role: revokedInvitation.role.value,
                createdAt: revokedInvitation.createdAt,
                expiredAt: revokedInvitation.expiration.value,
                acceptedAt: revokedInvitation.acceptedAt,
                revokedAt: revokedInvitation.revokedAt,
            };
        } catch (error) {
            throw new ApplicationError(error, RevokeInvitationUseCase.errors);
        }
    }
}
