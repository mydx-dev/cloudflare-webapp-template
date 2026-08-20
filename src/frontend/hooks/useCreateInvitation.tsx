import { client } from '@/lib/apiClient';
import { queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

import {
    type ErrorResolution,
    useGlobalErrorResolutions,
} from '../viewModel/ErrorResolution';

type CreateInvitationResponse = Awaited<
    ReturnType<(typeof client.api.invitations)['$post']>
>;

type CreateInvitationErrorResponse = Awaited<
    ReturnType<Exclude<CreateInvitationResponse, { status: 201 }>['json']>
>;

export const useCreateInvitation = () => {
    const globalErrorResolutions = useGlobalErrorResolutions();
    const errorResolutions: Record<
        CreateInvitationErrorResponse['code'],
        ErrorResolution
    > = {
        ...globalErrorResolutions,
    };

    const mutation = useMutation<
        unknown,
        ErrorResolution,
        {
            email: string;
            role: 'admin' | 'user';
        }
    >({
        mutationFn: async ({ email, role }) => {
            const response = await client.api.invitations.$post({
                json: {
                    email,
                    role,
                },
            });

            if (response.status !== 201) {
                const error = await response.json();
                throw errorResolutions[error.code];
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['invitations'],
            });
        },
    });
    return {
        mutation,
        resolutions: errorResolutions,
    };
};
