import { client } from '@/lib/apiClient';
import { InvitationViewModel } from '@/viewModel/InvitationViewModel';
import { useQuery } from '@tanstack/react-query';
import {
    ErrorResolution,
    useGlobalErrorResolutions,
} from '../viewModel/ErrorResolution';

type ListInvitationResponse = Awaited<
    ReturnType<(typeof client.api.invitations)['$get']>
>;

type ListInvitationErrorResponse = Awaited<
    ReturnType<Exclude<ListInvitationResponse, { status: 200 }>['json']>
>;

export const useListInvitation = () => {
    const globalErrorResolutions = useGlobalErrorResolutions();
    const errorResolutions: Record<
        ListInvitationErrorResponse['code'],
        ErrorResolution
    > = {
        ...globalErrorResolutions,
    };

    const query = useQuery<InvitationViewModel[], ErrorResolution>({
        queryKey: ['invitations'],
        initialData: [],
        queryFn: async () => {
            const response = await client.api.invitations.$get({ query: {} });

            if (response.status !== 200) {
                const error = await response.json();
                throw errorResolutions[error.code];
            }

            const body = await response.json();
            return body.map(
                (invitation) => new InvitationViewModel(invitation)
            );
        },
    });

    return {
        query,
        resolutions: errorResolutions,
    };
};
