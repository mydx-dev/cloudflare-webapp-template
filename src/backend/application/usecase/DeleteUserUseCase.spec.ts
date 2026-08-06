import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteUserUseCase } from './DeleteUserUseCase';

describe('ユーザーを削除する', () => {
    const removeUser = vi.fn();

    const auth = {
        api: {
            removeUser,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        removeUser.mockResolvedValue({
            success: true,
        });
    });

    it('指定されたユーザーを削除する', async () => {
        const useCase = new DeleteUserUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({
            userId: 'user-2',
            headers,
        });

        expect(removeUser).toHaveBeenCalledWith({
            headers,
            body: {
                userId: 'user-2',
            },
        });
    });

    it('削除結果を返す', async () => {
        const useCase = new DeleteUserUseCase(auth as never);

        const result = await useCase.execute({
            userId: 'user-2',
            headers: new Headers(),
        });

        expect(result).toEqual({
            success: true,
        });
    });

    it('削除に失敗した場合はエラーを通過させる', async () => {
        const error = new Error('Failed to delete user');

        removeUser.mockRejectedValue(error);

        const useCase = new DeleteUserUseCase(auth as never);

        await expect(
            useCase.execute({
                userId: 'user-2',
                headers: new Headers(),
            })
        ).rejects.toBe(error);
    });
});
