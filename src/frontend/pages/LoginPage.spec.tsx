import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { renderWithProviders } from '../../../tests/frontend/renderWithProviders';
import { LoginPage } from './LoginPage';

afterEach(() => {
    cleanup();
});

describe('初期状態', () => {
    it('メールアドレスとパスワードとログインボタンが表示される', () => {
        renderWithProviders(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('user@example.com');
        expect(emailInput).toBeVisible();

        const passwordInput = screen.getByPlaceholderText('••••••••');
        expect(passwordInput).toBeVisible();

        const loginButton = screen.getByRole('button', { name: /ログイン/i });
        expect(loginButton).toBeVisible();
    });
});

describe('メールアドレス入力', () => {
    it('メールアドレスが不正な場合、エラーメッセージが表示される', async () => {
        renderWithProviders(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('user@example.com');
        expect(emailInput).toBeVisible();

        // Simulate entering an invalid email
        await userEvent.type(emailInput, 'invalid-email');

        const errorMessage =
            await screen.findByText(/メールアドレスが不正です/i);
        expect(errorMessage).toBeVisible();
    });

    it('メールアドレスが有効な場合、エラーメッセージが表示されない', async () => {
        renderWithProviders(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('user@example.com');
        expect(emailInput).toBeVisible();

        // Simulate entering a valid email
        await userEvent.type(emailInput, 'user@example.com');

        const errorMessage = screen.queryByText(/メールアドレスが不正です/i);
        expect(errorMessage).toBeNull();
    });
});

describe('パスワード入力', () => {
    it('パスワードが８文字以下の場合、エラーメッセージが表示される', async () => {
        renderWithProviders(<LoginPage />);

        const passwordInput = screen.getByPlaceholderText('••••••••');
        expect(passwordInput).toBeVisible();

        await userEvent.click(passwordInput);
        await userEvent.type(passwordInput, 'short');

        const errorMessage = await screen.findByText(
            /パスワードは8文字以上である必要があります/i
        );
        expect(errorMessage).toBeVisible();
    });

    it('パスワードが英語小文字大文字含むかつ数字で入力されていない場合、エラーメッセージが表示される', async () => {
        renderWithProviders(<LoginPage />);

        const passwordInput = screen.getByPlaceholderText('••••••••');
        expect(passwordInput).toBeVisible();

        // Simulate entering a password that does not meet the criteria
        await userEvent.type(passwordInput, 'password');

        const errorMessage = await screen.findByText(
            /パスワードは英語大文字、小文字、数字を含む必要があります/i
        );
        expect(errorMessage).toBeVisible();
    });

    it('パスワードが英語小文字大文字含むかつ数字で入力されている場合、エラーメッセージが表示されない', async () => {
        renderWithProviders(<LoginPage />);

        const passwordInput = screen.getByPlaceholderText('••••••••');
        expect(passwordInput).toBeVisible();

        // Simulate entering a valid password
        await userEvent.type(passwordInput, 'Valid123');

        const errorMessage = screen.queryByText(
            /パスワードは8文字以上である必要があります/i
        );
        expect(errorMessage).toBeNull();
    });
});
