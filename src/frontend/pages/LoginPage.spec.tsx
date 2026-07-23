import { cleanup, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../../tests/frontend/renderWithProviders';
import { LoginPage } from './LoginPage';

const { getSessionMock, refetchMock, signInEmailMock, useSessionMock } =
    vi.hoisted(() => {
        return {
            getSessionMock: vi.fn(),
            refetchMock: vi.fn(),
            signInEmailMock: vi.fn(),
            useSessionMock: vi.fn(),
        };
    });

vi.mock('../lib/authClient', () => ({
    authClient: {
        getSession: getSessionMock,
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

const createDeferred = <T,>() => {
    let resolve: (value: T) => void;
    const promise = new Promise<T>((promiseResolve) => {
        resolve = promiseResolve;
    });

    return { promise, resolve: resolve! };
};

beforeEach(() => {
    refetchMock.mockResolvedValue(undefined);
    getSessionMock.mockResolvedValue({
        data: {
            session: { id: 'session-1' },
            user: { id: 'user-1' },
        },
        error: null,
    });
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

    it('ラベルと入力欄が関連付けられている', () => {
        renderLoginPage();

        expect(screen.getByLabelText('メールアドレス')).toBeVisible();
        expect(screen.getByLabelText('パスワード')).toBeVisible();
    });

    it('パスワード表示切替ボタンに状態に応じた名前がある', async () => {
        renderLoginPage();

        const showButton = screen.getByRole('button', {
            name: 'パスワードを表示',
        });
        expect(showButton).toBeVisible();

        await userEvent.click(showButton);

        expect(
            screen.getByRole('button', { name: 'パスワードを隠す' })
        ).toBeVisible();
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
        expect(getSessionMock).toHaveBeenCalledOnce();
        expect(await screen.findByText('初期画面')).toBeVisible();
    });

    it('認証失敗時に Better Auth の内部向け error を利用者向けエラーに変換して表示する', async () => {
        signInEmailMock.mockResolvedValue({
            data: null,
            error: { message: 'Invalid email or password' },
        });
        renderLoginPage();

        await fillLoginForm();
        await userEvent.click(
            screen.getByRole('button', { name: /ログイン/i })
        );

        expect(
            await screen.findByText(
                /メールアドレスまたはパスワードが正しくありません/i
            )
        ).toBeVisible();
        expect(refetchMock).not.toHaveBeenCalled();
        expect(getSessionMock).not.toHaveBeenCalled();
    });

    it('セッション取得に失敗した場合は session を refetch せず初期画面へ遷移しない', async () => {
        getSessionMock.mockResolvedValue({
            data: null,
            error: { message: 'Unauthorized' },
        });
        renderLoginPage();

        await fillLoginForm();
        await userEvent.click(
            screen.getByRole('button', { name: /ログイン/i })
        );

        expect(
            await screen.findByText(
                /ログイン状態を確認できませんでした。再度ログインしてください。/i
            )
        ).toBeVisible();
        expect(getSessionMock).toHaveBeenCalledOnce();
        expect(refetchMock).not.toHaveBeenCalled();
        expect(screen.queryByText('初期画面')).toBeNull();
    });

    it('getSession の検証完了前には session.data による redirect をしない', async () => {
        const getSessionDeferred = createDeferred<{
            data: {
                session: { id: string };
                user: { id: string };
            };
            error: null;
        }>();
        getSessionMock.mockReturnValue(getSessionDeferred.promise);
        renderLoginPage();

        await fillLoginForm();
        await userEvent.click(
            screen.getByRole('button', { name: /ログイン/i })
        );

        await waitFor(() => {
            expect(getSessionMock).toHaveBeenCalledOnce();
        });
        expect(screen.getByRole('status')).toBeVisible();
        expect(screen.queryByText('初期画面')).toBeNull();

        getSessionDeferred.resolve({
            data: {
                session: { id: 'session-1' },
                user: { id: 'user-1' },
            },
            error: null,
        });

        expect(await screen.findByText('初期画面')).toBeVisible();
    });

    it('refetch が session.data を更新し得る場合でも getSession 失敗時は初期画面へ遷移しない', async () => {
        getSessionMock.mockResolvedValue({
            data: null,
            error: { message: 'Network Error' },
        });
        refetchMock.mockImplementation(async () => {
            useSessionMock.mockReturnValue({
                data: { user: { id: 'user-1' } },
                isPending: false,
                refetch: refetchMock,
            });
        });
        renderLoginPage();

        await fillLoginForm();
        await userEvent.click(
            screen.getByRole('button', { name: /ログイン/i })
        );

        expect(
            await screen.findByText(
                /ログイン状態を確認できませんでした。再度ログインしてください。/i
            )
        ).toBeVisible();
        expect(getSessionMock).toHaveBeenCalledOnce();
        expect(refetchMock).not.toHaveBeenCalled();
        expect(screen.queryByText('初期画面')).toBeNull();
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
