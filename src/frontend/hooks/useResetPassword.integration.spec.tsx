import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useResetPassword } from './useResetPassword';

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

describe('useResetPassword integration', () => {
    it('実APIと疎通し、無効なトークンをErrorResolutionへ変換する', async () => {
        const { result } = renderHook(() => useResetPassword(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutation.mutate({
                token: crypto.randomUUID(),
                newPassword: 'Password123!',
            });
        });

        await waitFor(() => {
            expect(result.current.mutation.isError).toBe(true);
        });

        expect(result.current.mutation.error).toMatchObject({
            problem: 'パスワードリセットトークンが無効です',
            resolution:
                'パスワードリセットメールのURLを確認する、またはパスワードリセットメールを再送してください',
            action: {
                label: 'メールを再送',
                execute: expect.any(Function),
            },
        });
    });
});
