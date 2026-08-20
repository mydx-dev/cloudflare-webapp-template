import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../../shared/routes';
import { SigninPage } from './SigninPage';

const useSessionMock = vi.fn();
const isPublicSignUpEnabledMock = vi.fn();

vi.mock('../lib/authClient', () => ({
    authClient: {
        useSession: () => useSessionMock(),
    },
}));

vi.mock('../lib/signUpConfig', () => ({
    isPublicSignUpEnabled: () => isPublicSignUpEnabledMock(),
}));

vi.mock('@/components/user/SigninForm', () => ({
    SigninForm: () => <div>サインインフォーム</div>,
}));

const renderSigninPage = () =>
    render(
        <MemoryRouter initialEntries={['/signin']}>
            <Routes>
                <Route path="/signin" element={<SigninPage />} />
                <Route path={routes.home} element={<div>ホーム画面</div>} />
            </Routes>
        </MemoryRouter>
    );

describe('SigninPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        cleanup();

        useSessionMock.mockReturnValue({
            data: null,
            isPending: false,
        });

        isPublicSignUpEnabledMock.mockReturnValue(false);
    });

    afterEach(() => {
        cleanup();
    });

    it('セッション取得中はサインインフォームを表示しない', () => {
        useSessionMock.mockReturnValue({
            data: null,
            isPending: true,
        });

        renderSigninPage();

        expect(screen.queryByText('サインインフォーム')).toBeNull();
    });

    it('未ログインの場合はサインインフォームを表示する', () => {
        renderSigninPage();

        expect(screen.getByText('サインインフォーム')).toBeVisible();
    });

    it('ログイン済みの場合はホームへ遷移する', async () => {
        useSessionMock.mockReturnValue({
            data: {
                user: {
                    id: 'user-id',
                    email: 'user@example.com',
                },
            },
            isPending: false,
        });

        renderSigninPage();

        expect(await screen.findByText('ホーム画面')).toBeVisible();
    });

    it('公開サインアップが有効な場合は新規登録ボタンを表示する', () => {
        isPublicSignUpEnabledMock.mockReturnValue(true);

        renderSigninPage();

        expect(screen.getByRole('button', { name: '新規登録' })).toBeVisible();
    });

    it('公開サインアップが無効な場合は新規登録ボタンを表示しない', () => {
        isPublicSignUpEnabledMock.mockReturnValue(false);

        renderSigninPage();

        expect(screen.queryByRole('button', { name: '新規登録' })).toBeNull();
    });
});
