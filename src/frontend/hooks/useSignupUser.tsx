import { useMutation } from '@tanstack/react-query';
import { authClient } from '../lib/authClient';

type SignupRequest = {
    name: string;
    email: string;
    password: string;
};

const signupFailedMessage = 'ユーザー登録に失敗しました。再度お試しください。';

export const useSignupUser = () => {
    return useMutation({
        mutationFn: async ({ name, email, password }: SignupRequest) => {
            const result = await authClient.signUp.email({
                name,
                email,
                password,
            });

            if (result.error) {
                throw new Error(signupFailedMessage);
            }

            return result.data;
        },
    });
};
