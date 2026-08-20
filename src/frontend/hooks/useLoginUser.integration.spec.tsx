import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { useLoginUser } from './useLoginUser';

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
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('useLoginUser integration', () => {
    it('実APIと疎通し、不正な認証情報をErrorResolutionへ変換する', async () => {
        const { result } = renderHook(() => useLoginUser(), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.mutate({
                email: `not-exists-${crypto.randomUUID()}@example.com`,
                password: 'InvalidPassword123!',
            });
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toMatchObject({
            problem: 'メールアドレスまたはパスワードが正しくありません',
            resolution: '',
        });
    });
});
