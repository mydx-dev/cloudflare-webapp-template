import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RevokeUserSessionUseCase } from './RevokeUserSessionUseCase';

describe('ユーザーのセッションを失効する', () => {
    const revokeUserSession = vi.fn();

    const auth = {
        api: {
            revokeUserSession,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        revokeUserSession.mockResolvedValue({
            success: true,
        });
    });

    it('指定されたセッショントークンを失効する', async () => {
        const useCase = new RevokeUserSessionUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({
            sessionToken: 'session-token',
            headers,
        });

        expect(revokeUserSession).toHaveBeenCalledWith({
            headers,
            body: {
                sessionToken: 'session-token',
            },
        });
    });

    it('セッション失効結果を返す', async () => {
        const useCase = new RevokeUserSessionUseCase(auth as never);

        const result = await useCase.execute({
            sessionToken: 'session-token',
            headers: new Headers(),
        });

        expect(result).toEqual({
            success: true,
        });
    });

    it('セッション失効に失敗した場合はエラーを通過させる', async () => {
        const error = new Error('Failed to revoke session');

        revokeUserSession.mockRejectedValue(error);

        const useCase = new RevokeUserSessionUseCase(auth as never);

        await expect(
            useCase.execute({
                sessionToken: 'session-token',
                headers: new Headers(),
            })
        ).rejects.toBe(error);
    });
});
