import { useListInvitation } from '@/hooks/useListInvitation';
import { authClient } from '@/lib/authClient';
import { queryClient } from '@/lib/queryClient';
import { InvitationViewModel } from '@/viewModel/InvitationViewModel';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </MemoryRouter>
);

describe('useListInvitation', () => {
    beforeEach(async () => {
        queryClient.clear();

        const signInResult = await authClient.signIn.email({
            email: 'admin@example.com',
            password: 'Password123!',
        });

        expect(signInResult.error).toBeNull();
    });

    afterEach(async () => {
        const signOutResult = await authClient.signOut();

        expect(signOutResult.error).toBeNull();
    });

    it('招待一覧を取得できる', async () => {
        const { result } = renderHook(() => useListInvitation(), {
            wrapper,
        });

        await waitFor(() => {
            expect(result.current.query.isSuccess).toBe(true);
        });

        expect(Array.isArray(result.current.query.data)).toBe(true);

        for (const invitation of result.current.query.data) {
            expect(invitation).toBeInstanceOf(InvitationViewModel);
        }
    });
});
