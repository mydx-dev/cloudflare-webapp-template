import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SetUserRoleUseCase } from './SetUserRoleUseCase';

describe('ユーザーのロールを変更する', () => {
    const setRole = vi.fn();

    const auth = {
        api: {
            setRole,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        setRole.mockResolvedValue({
            user: {
                id: 'user-2',
                role: 'manager',
            },
        });
    });

    it('指定されたユーザーに指定されたロールを設定する', async () => {
        const useCase = new SetUserRoleUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({
            userId: 'user-2',
            role: 'manager',
            headers,
        });

        expect(setRole).toHaveBeenCalledWith({
            headers,
            body: {
                userId: 'user-2',
                role: 'manager',
            },
        });
    });

    it('ロール変更後のユーザーを返す', async () => {
        const useCase = new SetUserRoleUseCase(auth as never);

        const result = await useCase.execute({
            userId: 'user-2',
            role: 'manager',
            headers: new Headers(),
        });

        expect(result).toEqual({
            user: {
                id: 'user-2',
                role: 'manager',
            },
        });
    });

    it('ロール変更に失敗した場合はエラーを通過させる', async () => {
        const error = new Error('Failed to set role');

        setRole.mockRejectedValue(error);

        const useCase = new SetUserRoleUseCase(auth as never);

        await expect(
            useCase.execute({
                userId: 'user-2',
                role: 'manager',
                headers: new Headers(),
            })
        ).rejects.toBe(error);
    });
});
