import { useMutation } from '@tanstack/react-query';
import { authClient } from '../lib/authClient';

type LoginCredentials = {
    email: string;
    password: string;
};

const loginFailedMessage = 'メールアドレスまたはパスワードが正しくありません';

export const useLoginUser = () => {
    return useMutation({
        mutationFn: async ({ email, password }: LoginCredentials) => {
            const result = await authClient.signIn.email({
                email,
                password,
            });

            if (result.error) {
                throw new Error(loginFailedMessage);
            }

            return result.data;
        },
    });
};
