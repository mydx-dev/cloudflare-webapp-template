import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useSignupUser } from './useSignupUser';

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

describe('useSignupUser integration', () => {
    it('実APIと疎通できる', async () => {
        const { result } = renderHook(() => useSignupUser(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate({
                name: 'Integration Test',
                email: `integration-${crypto.randomUUID()}@example.com`,
                password: 'Password123!',
            });
        });

        await waitFor(() => {
            expect(
                result.current.mutation.isSuccess ||
                    result.current.mutation.isError
            ).toBe(true);
        });

        if (result.current.mutation.isSuccess) {
            expect(result.current.mutation.data).toBeTruthy();
            return;
        }

        expect(result.current.mutation.error).toMatchObject({
            problem: 'ユーザー登録が無効化されています',
            resolution: '管理者に問い合わせてください',
        });
    });
});
