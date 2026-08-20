import { Invitation } from '../../domain/invitation/Invitation';
import {
    InvitationAlreadyAcceptedError,
    InvitationExpiredError,
    InvitationNotFoundError,
    InvitationRevokedError,
    InviterMismatchError,
} from '../../domain/invitation/Invitation.errors';
import { InvitationMail } from '../../infrastructure/mail/InvitationMail';
import { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { ApplicationError } from '../dto/ApplicationError';
import { UseCase } from './UseCase';

export class ResendInvitationUseCase implements UseCase {
    private static readonly errors = [
        InviterMismatchError,
        InvitationAlreadyAcceptedError,
        InvitationNotFoundError,
    ] as const;

    public readonly errorCodes = ApplicationError.codes(
        ResendInvitationUseCase.errors
    );
    constructor(
        private readonly invitationRepository: InvitationRepository,
        private readonly invitationMail: InvitationMail
    ) {}

    async execute(
        invitationId: string,
        inviterId: string
    ): Promise<Invitation> {
        try {
            let invitation =
                await this.invitationRepository.findById(invitationId);

            if (!invitation) {
                throw new InvitationNotFoundError();
            }

            try {
                invitation.ensureSendable(inviterId);
            } catch (error) {
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
        } catch (error) {
            throw new ApplicationError(error, ResendInvitationUseCase.errors);
        }
    }
}
