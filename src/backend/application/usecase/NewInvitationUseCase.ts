import type { AuthRole } from '../../../shared/auth/accessControl';
import { Invitation } from '../../domain/invitation/Invitation';
import { InvitationMail } from '../../infrastructure/mail/InvitationMail';
import type { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { ApplicationError } from '../dto/ApplicationError';
import { InvitationDetail } from '../dto/InvitationDetail';
import { UseCase } from './UseCase';

export type NewInvitationUseCaseOutput = InvitationDetail & {
    token: string;
};

export class NewInvitationUseCase implements UseCase {
    private static readonly errors = [] as const;
    public readonly errorCodes = ApplicationError.codes(
        NewInvitationUseCase.errors
    );
    constructor(
        private readonly invitationRepository: InvitationRepository,
        private readonly invitationMail: InvitationMail
    ) {}

    async execute(
        inviterId: string,
        email: string,
        role?: AuthRole
    ): Promise<NewInvitationUseCaseOutput> {
        try {
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
        } catch (error) {
            throw new ApplicationError(error, NewInvitationUseCase.errors);
        }
    }
}
