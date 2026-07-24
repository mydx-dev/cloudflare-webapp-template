import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../tests/frontend/renderWithProviders';
import { AuthGuard } from './AuthGuard';
import { GuestOnlyGuard } from './GuestOnlyGuard';
import { PermissionGuard } from './PermissionGuard';

const { checkRolePermissionMock, useSessionMock } = vi.hoisted(() => ({
    checkRolePermissionMock: vi.fn(),
    useSessionMock: vi.fn(),
}));

vi.mock('../../lib/authClient', () => ({
    authClient: {
        admin: {
            checkRolePermission: checkRolePermissionMock,
        },
        useSession: useSessionMock,
    },
}));

const renderRoutes = (initialEntries: string[] = ['/private']) => {
    return renderWithProviders(
        <Routes>
            <Route
                path="/private"
                element={
                    <AuthGuard>
                        <main>保護画面</main>
                    </AuthGuard>
                }
            />
            <Route
                path="/sign-in"
                element={
                    <GuestOnlyGuard>
                        <main>ログイン画面</main>
                    </GuestOnlyGuard>
                }
            />
            <Route
                path="/users/edit"
                element={
                    <PermissionGuard
                        fallback={<main>権限がありません</main>}
                        permission={{ user: ['update'] }}
                    >
                        <main>編集画面</main>
                    </PermissionGuard>
                }
            />
            <Route path="/" element={<main>初期画面</main>} />
        </Routes>,
        { initialEntries }
    );
};

beforeEach(() => {
    checkRolePermissionMock.mockReturnValue(true);
    useSessionMock.mockReturnValue({
        data: null,
        isPending: false,
    });
});

describe('AuthGuard', () => {
    it('セッション取得中はリダイレクトせずローディングを表示する', () => {
        useSessionMock.mockReturnValue({
            data: null,
            isPending: true,
        });

        renderRoutes();

        expect(screen.getByRole('status')).toBeVisible();
        expect(screen.queryByText('ログイン画面')).not.toBeInTheDocument();
    });

    it('未認証の場合はログイン画面へリダイレクトする', async () => {
        renderRoutes();

        expect(await screen.findByText('ログイン画面')).toBeVisible();
    });

    it('認証済みの場合は保護画面を表示する', () => {
        useSessionMock.mockReturnValue({
            data: {
                user: { id: 'user-1', role: 'user' },
            },
            isPending: false,
        });

        renderRoutes();

        expect(screen.getByText('保護画面')).toBeVisible();
    });
});

describe('GuestOnlyGuard', () => {
    it('認証済みユーザーが認証画面へアクセスした場合は初期画面へリダイレクトする', async () => {
        useSessionMock.mockReturnValue({
            data: {
                user: { id: 'user-1', role: 'user' },
            },
            isPending: false,
        });

        renderRoutes(['/sign-in']);

        expect(await screen.findByText('初期画面')).toBeVisible();
    });
});

describe('PermissionGuard', () => {
    it('権限がある場合は子要素を表示する', () => {
        useSessionMock.mockReturnValue({
            data: {
                user: { id: 'user-1', role: 'manager' },
            },
            isPending: false,
        });

        renderRoutes(['/users/edit']);

        expect(checkRolePermissionMock).toHaveBeenCalledWith({
            role: 'manager',
            permissions: { user: ['update'] },
        });
        expect(screen.getByText('編集画面')).toBeVisible();
    });

    it('権限がない場合は fallback を表示する', () => {
        checkRolePermissionMock.mockReturnValue(false);
        useSessionMock.mockReturnValue({
            data: {
                user: { id: 'user-1', role: 'user' },
            },
            isPending: false,
        });

        renderRoutes(['/users/edit']);

        expect(screen.getByText('権限がありません')).toBeVisible();
    });
});
