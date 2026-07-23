import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../../tests/frontend/renderWithProviders';
import { LoginPage } from './LoginPage';

const { refetchMock, signInEmailMock, useSessionMock } = vi.hoisted(() => {
    return {
        refetchMock: vi.fn(),
        signInEmailMock: vi.fn(),
        useSessionMock: vi.fn(),
    };
});

vi.mock('../lib/authClient', () => ({
    authClient: {
        signIn: {
            email: signInEmailMock,
        },
        useSession: useSessionMock,
    },
}));

const renderLoginPage = () => {
    return renderWithProviders(
        <Routes>
            <Route path="/sign-in" element={<LoginPage />} />
            <Route path="/" element={<main>初期画面</main>} />
        </Routes>,
        { initialEntries: ['/sign-in'] }
    );
};

const fillLoginForm = async (password = 'p') => {
    await userEvent.type(
        screen.getByPlaceholderText('user@example.com'),
        'user@example.com'
    );
    await userEvent.type(screen.getByPlaceholderText('••••••••'), password);
};

beforeEach(() => {
    refetchMock.mockResolvedValue(undefined);
    signInEmailMock.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
    });
    useSessionMock.mockReturnValue({
        data: null,
        isPending: false,
        refetch: refetchMock,
    });
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('初期状態', () => {
    it('メールアドレスとパスワードとログインボタンが表示される', () => {
        renderLoginPage();

        const emailInput = screen.getByPlaceholderText('user@example.com');
        expect(emailInput).toBeVisible();

        const passwordInput = screen.getByPlaceholderText('••••••••');
        expect(passwordInput).toBeVisible();

        const loginButton = screen.getByRole('button', { name: /ログイン/i });
        expect(loginButton).toBeVisible();
    });

    it('新規登録が有効でない場合、新規登録リンクは表示されない', () => {
        renderLoginPage();

        expect(screen.queryByRole('link', { name: /新規登録/i })).toBeNull();
    });
});

describe('メールアドレス入力', () => {
    it('メールアドレスが不正な場合、エラーメッセージが表示される', async () => {
        renderLoginPage();

        const emailInput = screen.getByPlaceholderText('user@example.com');
        expect(emailInput).toBeVisible();

        // Simulate entering an invalid email
        await userEvent.type(emailInput, 'invalid-email');

        const errorMessage =
            await screen.findByText(/メールアドレスが不正です/i);
        expect(errorMessage).toBeVisible();
    });

    it('メールアドレスが有効な場合、エラーメッセージが表示されない', async () => {
        renderLoginPage();

        const emailInput = screen.getByPlaceholderText('user@example.com');
        expect(emailInput).toBeVisible();

        // Simulate entering a valid email
        await userEvent.type(emailInput, 'user@example.com');

        const errorMessage = screen.queryByText(/メールアドレスが不正です/i);
        expect(errorMessage).toBeNull();
    });
});

describe('パスワード入力', () => {
    it('パスワードが未入力の場合、エラーメッセージが表示される', async () => {
        renderLoginPage();

        const passwordInput = screen.getByPlaceholderText('••••••••');
        expect(passwordInput).toBeVisible();

        await userEvent.type(passwordInput, 'p');
        await userEvent.clear(passwordInput);

        const errorMessage =
            await screen.findByText(/パスワードを入力してください/i);
        expect(errorMessage).toBeVisible();
    });

    it('短いパスワードでも送信できる', async () => {
        renderLoginPage();

        await fillLoginForm('p');

        expect(
            screen.queryByText(/パスワードは8文字以上である必要があります/i)
        ).toBeNull();
        expect(
            screen.queryByText(
                /パスワードは英語大文字、小文字、数字を含む必要があります/i
            )
        ).toBeNull();
        expect(screen.getByRole('button', { name: /ログイン/i })).toBeEnabled();
    });
});

describe('ログイン送信', () => {
    it('ログイン成功時に認証 API を呼び出し、セッション取得後に初期画面へ遷移する', async () => {
        renderLoginPage();

        await fillLoginForm();
        await userEvent.click(
            screen.getByRole('button', { name: /ログイン/i })
        );

        await waitFor(() => {
            expect(signInEmailMock).toHaveBeenCalledWith({
                email: 'user@example.com',
                password: 'p',
            });
        });
        expect(refetchMock).toHaveBeenCalledOnce();
        expect(await screen.findByText('初期画面')).toBeVisible();
    });

    it('認証失敗時に Better Auth の error を利用者向けエラーとして表示する', async () => {
        signInEmailMock.mockResolvedValue({
            data: null,
            error: { message: 'メールアドレスまたはパスワードが違います' },
        });
        renderLoginPage();

        await fillLoginForm();
        await userEvent.click(
            screen.getByRole('button', { name: /ログイン/i })
        );

        expect(
            await screen.findByText(/メールアドレスまたはパスワードが違います/i)
        ).toBeVisible();
        expect(refetchMock).not.toHaveBeenCalled();
    });

    it('送信中はボタンを無効化してスピナーを表示する', async () => {
        signInEmailMock.mockReturnValue(new Promise(() => undefined));
        renderLoginPage();

        await fillLoginForm();
        await userEvent.click(
            screen.getByRole('button', { name: /ログイン/i })
        );

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /ログイン/i })
            ).toBeDisabled();
        });
        expect(screen.getByRole('status')).toBeVisible();
    });

    it('送信中の二重送信を防止する', async () => {
        signInEmailMock.mockReturnValue(new Promise(() => undefined));
        renderLoginPage();

        await fillLoginForm();
        const loginButton = screen.getByRole('button', { name: /ログイン/i });
        await userEvent.click(loginButton);

        await waitFor(() => {
            expect(loginButton).toBeDisabled();
            expect(signInEmailMock).toHaveBeenCalledOnce();
        });
    });
});

describe('認証済みユーザー', () => {
    it('/sign-in を開いた場合、初期画面へ redirect する', async () => {
        useSessionMock.mockReturnValue({
            data: { user: { id: 'user-1' } },
            isPending: false,
            refetch: refetchMock,
        });
        renderLoginPage();

        expect(await screen.findByText('初期画面')).toBeVisible();
        expect(
            screen.queryByPlaceholderText('user@example.com')
        ).not.toBeInTheDocument();
    });

    it('セッション取得中はログインフォームを表示しない', () => {
        useSessionMock.mockReturnValue({
            data: null,
            isPending: true,
            refetch: refetchMock,
        });
        renderLoginPage();

        expect(screen.getByRole('status')).toBeVisible();
        expect(
            screen.queryByPlaceholderText('user@example.com')
        ).not.toBeInTheDocument();
    });
});
