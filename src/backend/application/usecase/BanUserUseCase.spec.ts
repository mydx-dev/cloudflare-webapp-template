import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BanUserUseCase } from './BanUserUseCase';

describe('ユーザーをBANする', () => {
    const banUser = vi.fn();

    const auth = {
        api: {
            banUser,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        banUser.mockResolvedValue({
            user: {
                id: 'user-2',
                banned: true,
                banReason: 'policy violation',
            },
        });
    });

    it('指定された理由でユーザーをBANする', async () => {
        const useCase = new BanUserUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({
            userId: 'user-2',
            banReason: 'policy violation',
            headers,
        });

        expect(banUser).toHaveBeenCalledWith({
            headers,
            body: {
                userId: 'user-2',
                banReason: 'policy violation',
                banExpiresIn: undefined,
            },
        });
    });

    it('指定された期間ユーザーをBANする', async () => {
        const useCase = new BanUserUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({
            userId: 'user-2',
            banReason: 'temporary restriction',
            banExpiresIn: 3600,
            headers,
        });

        expect(banUser).toHaveBeenCalledWith({
            headers,
            body: {
                userId: 'user-2',
                banReason: 'temporary restriction',
                banExpiresIn: 3600,
            },
        });
    });

    it('BAN後のユーザーを返す', async () => {
        const useCase = new BanUserUseCase(auth as never);

        const result = await useCase.execute({
            userId: 'user-2',
            banReason: 'policy violation',
            headers: new Headers(),
        });

        expect(result).toMatchObject({
            user: {
                id: 'user-2',
                banned: true,
            },
        });
    });

    it('BANに失敗した場合はエラーを通過させる', async () => {
        const error = new Error('Failed to ban user');

        banUser.mockRejectedValue(error);

        const useCase = new BanUserUseCase(auth as never);

        await expect(
            useCase.execute({
                userId: 'user-2',
                banReason: 'policy violation',
                headers: new Headers(),
            })
        ).rejects.toBe(error);
    });
});
