import {
    InvalidInvitationTokenError,
    InvitationAlreadyAcceptedError,
    InvitationExpiredError,
    InvitationRevokedError,
} from '../../domain/invitation/Invitation.errors';
import { InvitationToken } from '../../domain/invitation/InvitationToken';
import { AuthAccount } from '../../infrastructure/auth/AuthAccount';
import { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { ApplicationError } from '../dto/ApplicationError';
import { UseCase } from './UseCase';

export class AcceptInvitationUseCase implements UseCase {
    private static readonly errors = [
        InvalidInvitationTokenError,
        InvitationExpiredError,
        InvitationAlreadyAcceptedError,
        InvitationRevokedError,
    ] as const;

    public readonly errorCodes = ApplicationError.codes(
        AcceptInvitationUseCase.errors
    );

    constructor(
        private readonly invitationRepository: InvitationRepository,
        private readonly authAccount: AuthAccount
    ) {}

    async execute(plainToken: string, name: string, password: string) {
        try {
            const token = new InvitationToken(plainToken, false);

            const invitation = await this.invitationRepository.findByToken(
                await token.hash()
            );

            if (!invitation) {
                throw new InvalidInvitationTokenError();
            }

            const acceptedInvitation = await invitation.accept(token);

            const user = await this.authAccount.ensure({
                email: invitation.invitee.value,
                name,
                password,
                role: invitation.role.value,
            });

            await this.invitationRepository.save(acceptedInvitation);

            return user;
        } catch (error) {
            throw new ApplicationError(error, AcceptInvitationUseCase.errors);
        }
    }
}
