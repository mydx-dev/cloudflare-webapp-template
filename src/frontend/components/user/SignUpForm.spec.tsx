import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { SignUpForm } from './SignUpForm';

const mocks = vi.hoisted(() => ({
    mutate: vi.fn(),
    useSignupUser: vi.fn(),
}));

vi.mock('../ui/ErrorResolutionAlert', () => ({
    ErrorResolutionAlert: ({
        errorResolution,
    }: {
        errorResolution: {
            problem: string;
            resolution: string;
        };
    }) => (
        <div data-testid="error-resolution-alert">
            {errorResolution.problem}
        </div>
    ),
}));

vi.mock('@/hooks/useSignupUser', () => ({
    useSignupUser: mocks.useSignupUser,
}));

vi.mocked(mocks.useSignupUser).mockReturnValue({
    mutation: {
        mutate: mocks.mutate,
        isPending: false,
        error: null,
    },
} as never);

const renderSignUpForm = () =>
    render(
        <MemoryRouter initialEntries={['/sign-up']}>
            <Routes>
                <Route path="/sign-up" element={<SignUpForm />} />
                <Route path="/" element={<div>初期画面</div>} />
            </Routes>
        </MemoryRouter>
    );

const fillValidForm = async () => {
    await userEvent.type(screen.getByLabelText('名前'), '山田 太郎');
    await userEvent.type(
        screen.getByLabelText('メールアドレス'),
        'user@example.com'
    );
    await userEvent.type(screen.getByLabelText('パスワード'), 'password123');
    await userEvent.type(
        screen.getByLabelText('パスワードの確認'),
        'password123'
    );
};

describe('SignUpForm', () => {
    beforeEach(() => {
        mocks.useSignupUser.mockReturnValue({
            mutation: {
                mutate: mocks.mutate,
                isPending: false,
                error: null,
            },
        });
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('初期状態では新規登録ボタンが無効である', () => {
        renderSignUpForm();

        expect(screen.getByRole('button', { name: '新規登録' })).toBeDisabled();
    });

    it('名前未入力では新規登録ボタンが無効である', async () => {
        renderSignUpForm();

        await userEvent.type(
            screen.getByLabelText('メールアドレス'),
            'user@example.com'
        );
        await userEvent.type(
            screen.getByLabelText('パスワード'),
            'password123'
        );
        await userEvent.type(
            screen.getByLabelText('パスワードの確認'),
            'password123'
        );

        expect(screen.getByRole('button', { name: '新規登録' })).toBeDisabled();
    });

    it('不正なメールアドレスではバリデーションエラーを表示する', async () => {
        renderSignUpForm();

        await userEvent.type(
            screen.getByLabelText('メールアドレス'),
            'invalid-email'
        );
        await userEvent.tab();

        expect(
            await screen.findByText('正しいメールアドレスを入力してください')
        ).toBeVisible();
    });

    it('パスワードが不正な場合はバリデーションエラーを表示する', async () => {
        renderSignUpForm();

        await userEvent.type(screen.getByLabelText('パスワード'), 'short');
        await userEvent.tab();

        expect(
            await screen.findByText(/パスワードは8文字以上である必要があります/)
        ).toBeVisible();
    });

    it('確認用パスワードが一致しない場合はエラーを表示する', async () => {
        renderSignUpForm();

        await userEvent.type(
            screen.getByLabelText('パスワード'),
            'password123'
        );
        await userEvent.type(
            screen.getByLabelText('パスワードの確認'),
            'different-password'
        );
        await userEvent.tab();

        expect(
            await screen.findByText(
                'パスワードと確認用パスワードが一致しません'
            )
        ).toBeVisible();
    });

    it('有効な入力で送信すると登録情報をmutationへ渡す', async () => {
        renderSignUpForm();

        await fillValidForm();

        await userEvent.click(screen.getByRole('button', { name: '新規登録' }));

        expect(mocks.mutate).toHaveBeenCalledWith(
            {
                name: '山田 太郎',
                email: 'user@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            },
            expect.objectContaining({
                onSuccess: expect.any(Function),
            })
        );
    });

    it('登録中は新規登録ボタンが無効になる', async () => {
        mocks.useSignupUser.mockReturnValue({
            mutation: {
                mutate: mocks.mutate,
                isPending: true,
                error: null,
            },
        });

        renderSignUpForm();

        await fillValidForm();

        expect(screen.getByRole('button', { name: '新規登録' })).toBeDisabled();
    });

    it('登録エラーがある場合はエラー解決情報を表示する', () => {
        const errorResolution = {
            problem: 'ユーザーを登録できませんでした',
            resolution: '入力内容を確認して再度お試しください',
        };

        mocks.useSignupUser.mockReturnValue({
            mutation: {
                mutate: mocks.mutate,
                isPending: false,
                error: errorResolution,
            },
        });

        renderSignUpForm();

        expect(screen.getByTestId('error-resolution-alert')).toBeVisible();

        expect(
            screen.getByText('ユーザーを登録できませんでした')
        ).toBeVisible();
    });

    it('登録成功時は初期画面へ遷移する', async () => {
        mocks.mutate.mockImplementation((_data, options) => {
            options?.onSuccess?.();
        });

        renderSignUpForm();

        await fillValidForm();

        await userEvent.click(screen.getByRole('button', { name: '新規登録' }));

        expect(await screen.findByText('初期画面')).toBeVisible();
    });
});
