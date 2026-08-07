import { InvitationToken } from '../../domain/invitation/InvitationToken';
import { AuthAccount } from '../../infrastructure/auth/AuthAccount';
import { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';

export class AcceptInvitationUseCase {
    constructor(
        private readonly invitationRepository: InvitationRepository,
        private readonly authAccount: AuthAccount
    ) {}

    async execute(plainToken: string, name: string, password: string) {
        const token = new InvitationToken(plainToken, false);
        const invitation = await this.invitationRepository.findByToken(
            await token.hash()
        );

        const acceptedInvitation = await invitation.accept(token);

        const user = await this.authAccount.ensure({
            email: invitation.invitee.value,
            name,
            password,
            role: invitation.role.value,
        });

        await this.invitationRepository.save(acceptedInvitation);

        return user;
    }
}
