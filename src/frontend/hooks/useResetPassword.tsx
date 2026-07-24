import { useMutation } from '@tanstack/react-query';
import { authClient } from '../lib/authClient';

type ResetPasswordRequest = {
    token: string;
    newPassword: string;
};

const resetPasswordFailedMessage =
    'パスワードの再設定に失敗しました。再度お試しください。';

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async ({ token, newPassword }: ResetPasswordRequest) => {
            const result = await authClient.resetPassword({
                token,
                newPassword,
            });

            if (result.error) {
                throw new Error(resetPasswordFailedMessage);
            }

            return result.data;
        },
    });
};
