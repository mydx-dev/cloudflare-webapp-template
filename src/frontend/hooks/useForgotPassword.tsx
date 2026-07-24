import { useMutation } from '@tanstack/react-query';
import { authClient } from '../lib/authClient';

type ForgotPasswordRequest = {
    email: string;
};

const forgotPasswordFailedMessage =
    'パスワード再設定のリクエストに失敗しました。再度お試しください。';

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async ({ email }: ForgotPasswordRequest) => {
            const result = await authClient.requestPasswordReset({
                email,
                redirectTo: '/reset-password',
            });

            if (result.error) {
                throw new Error(forgotPasswordFailedMessage);
            }

            return result.data;
        },
    });
};
