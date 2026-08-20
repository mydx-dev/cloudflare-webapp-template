import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { authClient } from '../lib/authClient';
import { useResendInvitation } from './useResendInvitation';

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <MemoryRouter>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </MemoryRouter>
    );
};

describe('useResendInvitation integration', () => {
    beforeEach(async () => {
        await authClient.signOut();
    });

    it('実APIと疎通し、認証エラーをErrorResolutionへ変換する', async () => {
        const { result } = renderHook(() => useResendInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate(crypto.randomUUID());
        });

        await waitFor(() => {
            expect(result.current.mutation.isError).toBe(true);
        });

        expect(result.current.mutation.error).toMatchObject({
            problem: '認証されていません',
            resolution: 'ログインしてください',
        });
    });
});
