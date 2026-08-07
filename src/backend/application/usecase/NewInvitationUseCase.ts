import type { AuthRole } from '../../../shared/auth/accessControl';
import { Invitation } from '../../domain/invitation/Invitation';
import { InvitationMail } from '../../infrastructure/mail/InvitationMail';
import type { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { InvitationDetail } from '../dto/InvitationDetail';

export type NewInvitationUseCaseOutput = InvitationDetail & {
    token: string;
};

export class NewInvitationUseCase {
    constructor(
        private readonly invitationRepository: InvitationRepository,
        private readonly invitationMail: InvitationMail
    ) {}

    async execute(
        inviterId: string,
        email: string,
        role?: AuthRole
    ): Promise<NewInvitationUseCaseOutput> {
        const invitation = Invitation.create(email, inviterId, role);

        await this.invitationRepository.save(invitation);

        await this.invitationMail.send(invitation);

        return {
            id: invitation.id,
            inviterId: invitation.inviter.id,
            email: invitation.invitee.value,
            status: invitation.status.value,
            role: invitation.role.value,
            token: invitation.token.value,
            createdAt: invitation.createdAt,
            expiredAt: invitation.expiration.value,
            acceptedAt: invitation.acceptedAt,
            revokedAt: invitation.revokedAt,
        };
    }
}
