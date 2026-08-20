import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useAcceptInvitation } from '@/hooks/useAcceptInvitation';
import { client } from '@/lib/apiClient';
import { authClient } from '@/lib/authClient';
import { queryClient } from '@/lib/queryClient';
import { MemoryRouter } from 'react-router-dom';

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </MemoryRouter>
);

describe('useAcceptInvitation', () => {
    beforeEach(async () => {
        queryClient.clear();

        const signInResult = await authClient.signIn.email({
            email: 'admin@example.com',
            password: 'Password123!',
        });

        expect(signInResult.error).toBeNull();
    });

    it('招待を承認できる', async () => {
        const email = `accept-${crypto.randomUUID()}@example.com`;

        const createResponse = await client.api.invitations.$post({
            json: {
                email,
                role: 'user',
            },
        });

        if (createResponse.status !== 201)
            throw new Error('Failed to create invitation');

        const invitation = await createResponse.json();

        const { result } = renderHook(() => useAcceptInvitation(), {
            wrapper,
        });

        result.current.mutation.mutate({
            token: invitation.token,
            name: 'Integration User',
            password: 'Password123!',
        });

        await waitFor(() => {
            expect(result.current.mutation.isSuccess).toBe(true);
        });

        expect(result.current.mutation.error).toBeNull();
        expect(result.current.mutation.data).toBeDefined();
    });

    it('APIエラーを受け取れる', async () => {
        const { result } = renderHook(() => useAcceptInvitation(), {
            wrapper,
        });

        result.current.mutation.mutate({
            token: 'invalid-token',
            name: 'Integration User',
            password: 'Password123!',
        });

        await waitFor(() => {
            expect(result.current.mutation.isError).toBe(true);
        });
    });
});
