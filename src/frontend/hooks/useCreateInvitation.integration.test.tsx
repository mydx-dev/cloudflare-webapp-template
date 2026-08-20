import { useCreateInvitation } from '@/hooks/useCreateInvitation';
import { authClient } from '@/lib/authClient';
import { queryClient } from '@/lib/queryClient';
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

describe('useCreateInvitation integration', () => {
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

    it('招待を作成できる', async () => {
        const { result } = renderHook(() => useCreateInvitation(), {
            wrapper,
        });

        result.current.mutation.mutate({
            email: `create-${crypto.randomUUID()}@example.com`,
            role: 'user',
        });

        await waitFor(() => {
            expect(result.current.mutation.isSuccess).toBe(true);
        });

        expect(result.current.mutation.error).toBeNull();
        expect(result.current.mutation.data).toBeDefined();
    });

    it('APIエラーを受け取れる', async () => {
        const { result } = renderHook(() => useCreateInvitation(), {
            wrapper,
        });

        result.current.mutation.mutate({
            email: '',
            role: 'user',
        });

        await waitFor(() => {
            expect(result.current.mutation.isError).toBe(true);
        });
    });
});
