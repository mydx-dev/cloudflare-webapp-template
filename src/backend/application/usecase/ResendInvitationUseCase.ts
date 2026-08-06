import { Invitation } from '../../domain/invitation/Invitation';
import {
    InvitationExpiredError,
    InvitationRevokedError,
} from '../../domain/invitation/Invitation.errors';
import { InvitationMail } from '../../infrastructure/mail/InvitationMail';
import { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';

export class ResendInvitationUseCase {
    constructor(
        private readonly invitationRepository: InvitationRepository,
        private readonly invitationMail: InvitationMail
    ) {}

    async execute(
        invitationId: string,
        inviterId: string
    ): Promise<Invitation> {
        let invitation = await this.invitationRepository.findById(invitationId);

        try {
            invitation.ensureSendable(inviterId);
        } catch (error: unknown) {
            if (!(
                error instanceof InvitationExpiredError ||
                error instanceof InvitationRevokedError
            )) {
                throw error;
            }

            const newInvitation = Invitation.create(
                invitation.invitee.value,
                invitation.inviter.id,
                invitation.role.value
            );

            await this.invitationRepository.save(newInvitation);
            invitation = newInvitation;
        }

        await this.invitationMail.send(invitation);

        return invitation;
    }
}
