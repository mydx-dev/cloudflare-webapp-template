import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../../tests/frontend/renderWithProviders';

const { isPublicSignUpEnabledMock, signUpEmailMock } = vi.hoisted(() => {
    return {
        isPublicSignUpEnabledMock: vi.fn(),
        signUpEmailMock: vi.fn(),
    };
});

vi.mock('../lib/authClient', () => ({
    authClient: {
        signUp: {
            email: signUpEmailMock,
        },
    },
}));

vi.mock('../lib/signUpConfig', () => ({
    isPublicSignUpEnabled: isPublicSignUpEnabledMock,
}));

const renderSignupPage = async (signUpEnabled = true) => {
    isPublicSignUpEnabledMock.mockReturnValue(signUpEnabled);
    vi.resetModules();
    const { SignupPage } = await import('./SignupPage');

    return renderWithProviders(
        <Routes>
            <Route path="/sign-up" element={<SignupPage />} />
            <Route path="/sign-in" element={<main>ログイン画面</main>} />
            <Route path="/" element={<main>初期画面</main>} />
        </Routes>,
        { initialEntries: ['/sign-up'] }
    );
};

const fillSignupForm = async (confirmPassword = 'password123') => {
    await userEvent.type(screen.getByLabelText('名前'), '山田 太郎');
    await userEvent.type(
        screen.getByLabelText('メールアドレス'),
        'user@example.com'
    );
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123');
    await userEvent.type(
        screen.getByLabelText('パスワードの確認'),
        confirmPassword
    );
};

beforeEach(() => {
    signUpEmailMock.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
    });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('初期状態', () => {
    it('公開登録が有効な場合、登録フォームが表示される', async () => {
        await renderSignupPage();

        expect(screen.getByLabelText('名前')).toBeVisible();
        expect(screen.getByLabelText('メールアドレス')).toBeVisible();
        expect(screen.getByLabelText('パスワード')).toBeVisible();
        expect(screen.getByLabelText('パスワードの確認')).toBeVisible();
        expect(
            screen.getByRole('button', { name: /新規登録/i })
        ).toBeDisabled();
    });

    it('公開登録が無効な場合、登録フォームを表示しない', async () => {
        await renderSignupPage(false);

        expect(
            screen.getByText(/現在、新規ユーザー登録は受け付けていません/i)
        ).toBeVisible();
        expect(screen.queryByLabelText('メールアドレス')).toBeNull();
        expect(
            screen.getByRole('link', { name: /ログイン画面に戻る/i })
        ).toHaveAttribute('href', '/sign-in');
    });
});

describe('入力バリデーション', () => {
    it('パスワード不一致の場合、エラーメッセージが表示される', async () => {
        await renderSignupPage();

        await fillSignupForm('different-password');

        expect(
            await screen.findByText(
                /パスワードと確認用パスワードが一致しません/i
            )
        ).toBeVisible();
        expect(
            screen.getByRole('button', { name: /新規登録/i })
        ).toBeDisabled();
    });

    it('パスワード要件は8文字以上128文字以下で検証する', async () => {
        await renderSignupPage();

        await userEvent.type(screen.getByLabelText('パスワード'), 'short');

        expect(
            await screen.findByText(
                /パスワードは8文字以上である必要があります/i
            )
        ).toBeVisible();
        expect(
            screen.queryByText(
                /パスワードは英語大文字、小文字、数字を含む必要があります/i
            )
        ).toBeNull();
    });
});

describe('登録送信', () => {
    it('登録成功時に認証 API を呼び出し、初期画面へ遷移する', async () => {
        await renderSignupPage();

        await fillSignupForm();
        await userEvent.click(
            screen.getByRole('button', { name: /新規登録/i })
        );

        await waitFor(() => {
            expect(signUpEmailMock).toHaveBeenCalledWith({
                name: '山田 太郎',
                email: 'user@example.com',
                password: 'password123',
            });
        });
        expect(await screen.findByText('初期画面')).toBeVisible();
    });

    it('登録失敗時に利用者向けエラーを表示する', async () => {
        signUpEmailMock.mockResolvedValue({
            data: null,
            error: { message: 'User already exists' },
        });
        await renderSignupPage();

        await fillSignupForm();
        await userEvent.click(
            screen.getByRole('button', { name: /新規登録/i })
        );

        expect(
            await screen.findByText(
                /ユーザー登録に失敗しました。再度お試しください。/i
            )
        ).toBeVisible();
        expect(screen.queryByText('初期画面')).toBeNull();
    });

    it('送信中はボタンを無効化してスピナーを表示する', async () => {
        signUpEmailMock.mockReturnValue(new Promise(() => undefined));
        await renderSignupPage();

        await fillSignupForm();
        await userEvent.click(
            screen.getByRole('button', { name: /新規登録/i })
        );

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /新規登録/i })
            ).toBeDisabled();
        });
        expect(screen.getByRole('status')).toBeVisible();
    });
});
