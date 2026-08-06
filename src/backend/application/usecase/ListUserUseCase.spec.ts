import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ListUserUseCase } from './ListUserUseCase';

describe('ユーザー一覧を取得する', () => {
    const listUsers = vi.fn();

    const auth = {
        api: {
            listUsers,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        listUsers.mockResolvedValue({
            users: [
                {
                    id: 'user-2',
                    name: 'Target User',
                    email: 'target@example.com',
                    role: 'user',
                    banned: false,
                },
            ],
            total: 1,
            limit: 50,
            offset: 0,
        });
    });

    it('statusを指定しない場合はBAN状態で絞り込まない', async () => {
        const useCase = new ListUserUseCase(auth as never);
        const headers = new Headers();

        const result = await useCase.execute({
            headers,
        });

        expect(listUsers).toHaveBeenCalledWith({
            headers,
            query: expect.not.objectContaining({
                filterField: 'banned',
            }),
        });

        expect(result).toMatchObject({
            total: 1,
            users: [
                {
                    id: 'user-2',
                    email: 'target@example.com',
                },
            ],
        });
    });

    it('statusがactiveの場合はBANされていないユーザーを取得する', async () => {
        const useCase = new ListUserUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({
            headers,
            status: 'active',
        });

        expect(listUsers).toHaveBeenCalledWith({
            headers,
            query: expect.objectContaining({
                filterField: 'banned',
                filterValue: false,
            }),
        });
    });

    it('statusがbannedの場合はBANされたユーザーを取得する', async () => {
        const useCase = new ListUserUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({
            headers,
            status: 'banned',
        });

        expect(listUsers).toHaveBeenCalledWith({
            headers,
            query: expect.objectContaining({
                filterField: 'banned',
                filterValue: true,
            }),
        });
    });

    it('指定された名前でユーザーを検索する', async () => {
        const useCase = new ListUserUseCase(auth as never);
        const headers = new Headers();

        await useCase.execute({
            headers,
            searchField: 'name',
            searchValue: 'Target',
        });

        expect(listUsers).toHaveBeenCalledWith({
            headers,
            query: expect.objectContaining({
                searchField: 'name',
                searchValue: 'Target',
            }),
        });
    });

    it('Better Authの取得結果を返す', async () => {
        const expected = {
            users: [],
            total: 0,
            limit: 50,
            offset: 0,
        };

        listUsers.mockResolvedValue(expected);

        const useCase = new ListUserUseCase(auth as never);

        const result = await useCase.execute({
            headers: new Headers(),
        });

        expect(result).toBe(expected);
    });
});
