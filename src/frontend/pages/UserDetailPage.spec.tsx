import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../../tests/frontend/renderWithProviders';
import { UserDetailPage } from './UserDetailPage';

const {
    deleteMutateAsyncMock,
    revokeMutateAsyncMock,
    setRoleMutateAsyncMock,
    signOutMock,
    toggleBanMutateAsyncMock,
    useAdminUserMock,
} = vi.hoisted(() => ({
    deleteMutateAsyncMock: vi.fn(),
    revokeMutateAsyncMock: vi.fn(),
    setRoleMutateAsyncMock: vi.fn(),
    signOutMock: vi.fn(),
    toggleBanMutateAsyncMock: vi.fn(),
    useAdminUserMock: vi.fn(),
}));

vi.mock('../lib/authClient', () => ({
    authClient: {
        signOut: signOutMock,
        useSession: () => ({
            data: {
                user: {
                    email: 'admin@example.com',
                    name: 'Admin User',
                },
            },
        }),
    },
}));

vi.mock('../hooks/useAdminUsers', () => ({
    useAdminUser: useAdminUserMock,
    useDeleteAdminUser: () => ({
        error: null,
        isPending: false,
        mutateAsync: deleteMutateAsyncMock,
    }),
    useRevokeAdminUserSession: () => ({
        error: null,
        isPending: false,
        mutateAsync: revokeMutateAsyncMock,
    }),
    useSetAdminUserRole: () => ({
        error: null,
        isPending: false,
        mutateAsync: setRoleMutateAsyncMock,
    }),
    useToggleAdminUserBan: () => ({
        error: null,
        isPending: false,
        mutateAsync: toggleBanMutateAsyncMock,
    }),
}));

const userDetailResponse = {
    user: {
        id: 'user-1',
        name: '山田 太郎',
        email: 'taro@example.com',
        emailVerified: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
        role: 'user',
        banned: false,
    },
    sessions: [
        {
            id: 'session-1',
            token: 'token-1',
            userId: 'user-1',
            userAgent: 'Chrome (macOS)',
            ipAddress: '127.0.0.1',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-02T00:00:00.000Z',
            expiresAt: '2026-02-01T00:00:00.000Z',
        },
    ],
};

const renderUserDetailPage = () => {
    return renderWithProviders(
        <Routes>
            <Route path="/users" element={<main>一覧画面</main>} />
            <Route path="/users/:id" element={<UserDetailPage />} />
        </Routes>,
        { initialEntries: ['/users/user-1'] }
    );
};

beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    useAdminUserMock.mockReturnValue({
        data: userDetailResponse,
        error: null,
        isLoading: false,
    });
    deleteMutateAsyncMock.mockResolvedValue({ success: true });
    revokeMutateAsyncMock.mockResolvedValue({ success: true });
    setRoleMutateAsyncMock.mockResolvedValue({
        user: { ...userDetailResponse.user, role: 'manager' },
    });
    toggleBanMutateAsyncMock.mockResolvedValue({
        user: { ...userDetailResponse.user, banned: true },
    });
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
});

describe('UserDetailPage', () => {
    it('ユーザー詳細とセッションを表示する', () => {
        renderUserDetailPage();

        expect(
            screen.getByRole('heading', { name: '山田 太郎' })
        ).toBeVisible();
        expect(screen.getByText('taro@example.com')).toBeVisible();
        expect(screen.getByText('Active')).toBeVisible();
        expect(screen.getByText('Chrome (macOS)')).toBeVisible();
        expect(screen.getByText('127.0.0.1')).toBeVisible();
    });

    it('ロール変更、BAN、セッション失効を呼び出す', async () => {
        renderUserDetailPage();

        await userEvent.selectOptions(screen.getByLabelText('ロール変更'), [
            'manager',
        ]);
        await userEvent.click(
            screen.getByRole('button', { name: 'アクセス制限 (BAN)' })
        );
        await userEvent.click(screen.getByRole('button', { name: 'Revoke' }));

        expect(setRoleMutateAsyncMock).toHaveBeenCalledWith('manager');
        expect(toggleBanMutateAsyncMock).toHaveBeenCalledWith(false);
        expect(revokeMutateAsyncMock).toHaveBeenCalledWith('token-1');
    });

    it('削除後に一覧画面へ遷移する', async () => {
        renderUserDetailPage();

        await userEvent.click(
            screen.getByRole('button', {
                name: 'アカウントを完全に削除する',
            })
        );

        expect(deleteMutateAsyncMock).toHaveBeenCalledWith('user-1');
        await waitFor(() => {
            expect(screen.getByText('一覧画面')).toBeVisible();
        });
    });
});
