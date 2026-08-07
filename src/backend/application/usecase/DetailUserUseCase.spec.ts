import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserNotFoundError } from '../../domain/user/User.errors';
import { DetailUserUseCase } from './DetailUserUseCase';

describe('ユーザー詳細を取得する', () => {
    const getUser = vi.fn();
    const listUserSessions = vi.fn();

    const auth = {
        api: {
            getUser,
            listUserSessions,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        getUser.mockResolvedValue({
            id: 'user-2',
            name: 'Target User',
            email: 'target@example.com',
            role: 'user',
            banned: false,
        });

        listUserSessions.mockResolvedValue({
            sessions: [
                {
                    id: 'session-2',
                    token: 'token-2',
                    userId: 'user-2',
                    createdAt: new Date('2026-01-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
                    expiresAt: new Date('2026-02-01T00:00:00.000Z'),
                },
            ],
        });
    });

    it('指定されたユーザーを取得する', async () => {
        const useCase = new DetailUserUseCase(auth as never);
        const headers = new Headers();
        const input = { userId: 'user-2', headers };

        await useCase.execute(input);

        expect(getUser).toHaveBeenCalledWith({
            headers,
            query: {
                id: 'user-2',
            },
        });
    });

    it('指定されたユーザーのセッション一覧を取得する', async () => {
        const useCase = new DetailUserUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({ userId: 'user-2', headers });

        expect(listUserSessions).toHaveBeenCalledWith({
            headers,
            body: {
                userId: 'user-2',
            },
        });
    });

    it('ユーザー情報とセッション一覧を返す', async () => {
        const useCase = new DetailUserUseCase(auth as never);

        const result = await useCase.execute({
            userId: 'user-2',
            headers: new Headers(),
        });

        expect(result).toMatchObject({
            user: {
                id: 'user-2',
                email: 'target@example.com',
            },
            sessions: [
                {
                    id: 'session-2',
                    token: 'token-2',
                },
            ],
        });
    });

    it('ユーザー取得に失敗した場合はエラーを出す', async () => {
        getUser.mockRejectedValue(new UserNotFoundError());

        const useCase = new DetailUserUseCase(auth as never);
        const headers = new Headers();

        await expect(
            useCase.execute({ userId: 'missing-user', headers })
        ).rejects.toBeInstanceOf(UserNotFoundError);

        expect(getUser).toHaveBeenCalledWith({
            headers,
            query: {
                id: 'missing-user',
            },
        });
    });
});
