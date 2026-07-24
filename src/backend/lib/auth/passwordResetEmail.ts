type PasswordResetUser = {
    email: string;
    name?: string | null;
};

type PasswordResetEmailParams = {
    from: string;
    user: PasswordResetUser;
    url: string;
};

const subject = 'パスワード再設定のご案内';

const escapeHtml = (value: string) => {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
};

export const createPasswordResetEmailMessage = ({
    from,
    user,
    url,
}: PasswordResetEmailParams): EmailMessageBuilder => {
    const escapedUrl = escapeHtml(url);
    const displayName = user.name?.trim() || user.email;

    return {
        to: user.email,
        from,
        subject,
        text: [
            `${displayName} 様`,
            '',
            'パスワード再設定のリクエストを受け付けました。',
            '以下のURLからパスワードを再設定してください。',
            '',
            url,
            '',
            'このメールに心当たりがない場合は、このまま破棄してください。',
        ].join('\n'),
        html: [
            `<p>${escapeHtml(displayName)} 様</p>`,
            '<p>パスワード再設定のリクエストを受け付けました。</p>',
            '<p>以下のリンクからパスワードを再設定してください。</p>',
            `<p><a href="${escapedUrl}">パスワードを再設定する</a></p>`,
            '<p>このメールに心当たりがない場合は、このまま破棄してください。</p>',
        ].join(''),
    };
};

const getErrorMetadata = (error: unknown) => {
    if (!(error instanceof Error)) {
        return { name: 'UnknownError' };
    }

    const code =
        'code' in error && typeof error.code === 'string'
            ? error.code
            : undefined;

    return {
        name: error.name,
        code,
    };
};

export const sendPasswordResetEmail = async (
    email: SendEmail,
    params: PasswordResetEmailParams
) => {
    try {
        await email.send(createPasswordResetEmailMessage(params));
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
            'Password reset email sending failed',
            getErrorMetadata(error)
        );
        throw new Error('Password reset email sending failed');
    }
};
