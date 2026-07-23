import { useMutation } from '@tanstack/react-query';
import { authClient } from '../lib/authClient';

export const useLoginUser = (email: string, password: string) => {
    return useMutation({
        mutationFn: () =>
            authClient.signIn.email({
                email,
                password,
            }),
    });
};
