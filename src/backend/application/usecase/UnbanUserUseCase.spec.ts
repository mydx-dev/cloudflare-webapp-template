import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnbanUserUseCase } from './UnbanUserUseCase';

describe('ユーザーのBANを解除する', () => {
    const unbanUser = vi.fn();

    const auth = {
        api: {
            unbanUser,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        unbanUser.mockResolvedValue({
            user: {
                id: 'user-2',
                banned: false,
            },
        });
    });

    it('指定されたユーザーのBANを解除する', async () => {
        const useCase = new UnbanUserUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({
            userId: 'user-2',
            headers,
        });

        expect(unbanUser).toHaveBeenCalledWith({
            headers,
            body: {
                userId: 'user-2',
            },
        });
    });

    it('BAN解除後のユーザーを返す', async () => {
        const useCase = new UnbanUserUseCase(auth as never);

        const result = await useCase.execute({
            userId: 'user-2',
            headers: new Headers(),
        });

        expect(result).toMatchObject({
            user: {
                id: 'user-2',
                banned: false,
            },
        });
    });

    it('BAN解除に失敗した場合はエラーを通過させる', async () => {
        const error = new Error('Failed to unban user');

        unbanUser.mockRejectedValue(error);

        const useCase = new UnbanUserUseCase(auth as never);

        await expect(
            useCase.execute({
                userId: 'user-2',
                headers: new Headers(),
            })
        ).rejects.toBe(error);
    });
});
