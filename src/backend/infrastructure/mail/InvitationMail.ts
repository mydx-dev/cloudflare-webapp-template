import { appConfig } from '../../../shared/appConfig';
import { routes } from '../../../shared/routes';
import { Invitation } from '../../domain/invitation/Invitation';

export class InvitationMail {
    constructor(
        private readonly sendEmail: SendEmail,
        private readonly baseUrl: string
    ) {}

    public async send(invitation: Invitation): Promise<void> {
        const normalizedBaseUrl = this.baseUrl.replace(/\/$/, '');

        const to = invitation.invitee.value;
        const subject = `【${appConfig.name}】アカウント招待のお知らせ`;
        const from = appConfig.supportEmail;
        const expirationText = new Intl.DateTimeFormat('ja-JP', {
            dateStyle: 'long',
            timeStyle: 'short',
            timeZone: 'Asia/Tokyo',
        }).format(invitation.expiration.value);
        const body = `${to} 様

${appConfig.name} への招待が届いています。

以下のリンクからアカウント登録を完了してください。

${normalizedBaseUrl}${routes.invitation.accept.path}?token=${invitation.token.value}

この招待リンクの有効期限は ${expirationText} です。本日より7日間有効です。
有効期限を過ぎた場合は、管理者へ再招待をご依頼ください。

このメールに心当たりがない場合は、対応の必要はありません。

--
${appConfig.name}`;

        await this.sendEmail.send({
            to,
            subject,
            text: body,
            from,
        });
    }
}
