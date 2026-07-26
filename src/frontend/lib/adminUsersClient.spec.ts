import { afterEach, describe, expect, it, vi } from 'vitest';
import { listAdminUsers } from './adminUsersClient';

const okUsersResponse = {
    limit: 50,
    offset: 0,
    total: 0,
    users: [],
};

describe('adminUsersClient', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('status が all のときは status query parameter を送信しない', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify(okUsersResponse), {
                headers: { 'content-type': 'application/json' },
                status: 200,
            })
        );
        vi.stubGlobal('fetch', fetchMock);

        await listAdminUsers();

        expect(fetchMock).toHaveBeenCalledOnce();
        const requestUrl = String(fetchMock.mock.calls[0][0]);
        expect(requestUrl).toContain('/api/users?');
        expect(requestUrl).not.toContain('status=all');
    });

    it('status が active または banned のときだけ status query parameter を送信する', async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify(okUsersResponse), {
                headers: { 'content-type': 'application/json' },
                status: 200,
            })
        );
        vi.stubGlobal('fetch', fetchMock);

        await listAdminUsers({ status: 'banned' });

        expect(String(fetchMock.mock.calls[0][0])).toContain('status=banned');
    });
});
