import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { SignupPage } from './SignupPage';

const mocks = vi.hoisted(() => ({
    isPublicSignUpEnabled: vi.fn(),
}));

vi.mock('@/lib/signUpConfig', () => ({
    isPublicSignUpEnabled: mocks.isPublicSignUpEnabled,
}));

vi.mock('../components/user/SignUpForm', () => ({
    SignUpForm: () => <div>サインアップフォーム</div>,
}));

const renderSignupPage = () =>
    render(
        <MemoryRouter initialEntries={['/sign-up']}>
            <Routes>
                <Route path="/sign-up" element={<SignupPage />} />
                <Route path="/sign-in" element={<div>ログイン画面</div>} />
            </Routes>
        </MemoryRouter>
    );

describe('SignupPage', () => {
    beforeEach(() => {
        mocks.isPublicSignUpEnabled.mockReturnValue(true);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('公開サインアップが有効な場合はサインアップフォームを表示する', () => {
        renderSignupPage();

        expect(screen.getByText('サインアップフォーム')).toBeVisible();
        expect(screen.getByText('新規アカウント登録')).toBeVisible();
    });

    it('公開サインアップが無効な場合は登録不可メッセージを表示する', () => {
        mocks.isPublicSignUpEnabled.mockReturnValue(false);

        renderSignupPage();

        expect(
            screen.getByText(/現在、新規ユーザー登録は受け付けていません/)
        ).toBeVisible();

        expect(screen.queryByText('サインアップフォーム')).toBeNull();
    });

    it('公開サインアップが無効な場合はログインページへ戻れる', async () => {
        mocks.isPublicSignUpEnabled.mockReturnValue(false);

        renderSignupPage();

        await userEvent.click(
            screen.getByRole('link', { name: 'ログインページへ戻る' })
        );

        expect(await screen.findByText('ログイン画面')).toBeVisible();
    });

    it('ログインボタンを押すとログインページへ遷移する', async () => {
        renderSignupPage();

        await userEvent.click(screen.getByRole('button', { name: 'ログイン' }));

        expect(await screen.findByText('ログイン画面')).toBeVisible();
    });
});
