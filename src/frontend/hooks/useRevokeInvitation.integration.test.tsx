import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { authClient } from '../lib/authClient';
import { useRevokeInvitation } from './useRevokeInvitation';

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

describe('useRevokeInvitation integration', () => {
    beforeEach(() => {
        authClient.signOut();
    });
    it('実APIの認証エラーをErrorResolutionへ変換する', async () => {
        const { result } = renderHook(() => useRevokeInvitation(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate(crypto.randomUUID());
        });

        await waitFor(() => {
            expect(result.current.mutation.isError).toBe(true);
        });

        expect(result.current.mutation.error?.problem).toBe(
            result.current.resolutions.UNAUTHORIZED.problem
        );

        expect(result.current.mutation.error?.resolution).toBe(
            result.current.resolutions.UNAUTHORIZED.resolution
        );
    });
});
