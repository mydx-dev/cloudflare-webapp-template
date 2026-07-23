import { useMutation } from '@tanstack/react-query';
import { authClient } from '../lib/authClient';

type LoginCredentials = {
    email: string;
    password: string;
};

type AuthError = {
    message?: string;
    statusText?: string;
};

const getLoginErrorMessage = (error: AuthError | null) => {
    return (
        error?.message ||
        error?.statusText ||
        'ログインに失敗しました。メールアドレスとパスワードを確認してください。'
    );
};

export const useLoginUser = () => {
    return useMutation({
        mutationFn: async ({ email, password }: LoginCredentials) => {
            const result = await authClient.signIn.email({
                email,
                password,
            });

            if (result.error) {
                throw new Error(getLoginErrorMessage(result.error));
            }

            return result.data;
        },
    });
};
