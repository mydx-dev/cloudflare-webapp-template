import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../../index';

const {
    banUserMock,
    createAuthMock,
    getSessionMock,
    getUserMock,
    listUserSessionsMock,
    listUsersMock,
    removeUserMock,
    revokeUserSessionMock,
    setRoleMock,
    unbanUserMock,
    userHasPermissionMock,
} = vi.hoisted(() => ({
    banUserMock: vi.fn(),
    createAuthMock: vi.fn(),
    getSessionMock: vi.fn(),
    getUserMock: vi.fn(),
    listUserSessionsMock: vi.fn(),
    listUsersMock: vi.fn(),
    removeUserMock: vi.fn(),
    revokeUserSessionMock: vi.fn(),
    setRoleMock: vi.fn(),
    unbanUserMock: vi.fn(),
    userHasPermissionMock: vi.fn(),
}));

vi.mock('../../lib/auth/createAuth', () => ({
    createAuth: createAuthMock,
}));

const createUser = (overrides: Record<string, unknown> = {}) => ({
    id: 'user-2',
    name: 'Admin Target',
    email: 'target@example.com',
    emailVerified: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    role: 'user',
    banned: false,
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
    getSessionMock.mockResolvedValue({
        session: { id: 'session-1' },
        user: { id: 'admin-1', role: 'admin' },
    });
    userHasPermissionMock.mockResolvedValue({
        success: true,
    });
    listUsersMock.mockResolvedValue({
        users: [createUser()],
        total: 1,
        limit: 50,
        offset: 0,
    });
    getUserMock.mockResolvedValue(createUser());
    listUserSessionsMock.mockResolvedValue({
        sessions: [
            {
                id: 'session-2',
                token: 'token-2',
                userId: 'user-2',
                createdAt: new Date('2026-01-01T00:00:00Z'),
                updatedAt: new Date('2026-01-02T00:00:00Z'),
                expiresAt: new Date('2026-02-01T00:00:00Z'),
            },
        ],
    });
    setRoleMock.mockResolvedValue({ user: createUser({ role: 'manager' }) });
    banUserMock.mockResolvedValue({ user: createUser({ banned: true }) });
    unbanUserMock.mockResolvedValue({ user: createUser({ banned: false }) });
    removeUserMock.mockResolvedValue({ success: true });
    revokeUserSessionMock.mockResolvedValue({ success: true });
    createAuthMock.mockReturnValue({
        api: {
            banUser: banUserMock,
            getSession: getSessionMock,
            getUser: getUserMock,
            listUserSessions: listUserSessionsMock,
            listUsers: listUsersMock,
            removeUser: removeUserMock,
            revokeUserSession: revokeUserSessionMock,
            setRole: setRoleMock,
            unbanUser: unbanUserMock,
            userHasPermission: userHasPermissionMock,
        },
    });
});

describe('Users API', () => {
    it('管理者向けユーザー一覧を Better Auth Admin Plugin 経由で返す', async () => {
        const res = await app.request(
            '/api/users?searchValue=target&searchField=name&status=active',
            {},
            {} as Env
        );

        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({
            total: 1,
            users: [{ id: 'user-2', email: 'target@example.com' }],
        });
        expect(userHasPermissionMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            body: {
                permissions: { user: ['list'] },
            },
        });
        expect(listUsersMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            query: expect.objectContaining({
                filterField: 'banned',
                filterValue: false,
                searchField: 'name',
                searchValue: 'target',
            }),
        });
    });

    it('ユーザー詳細とセッション一覧を取得する', async () => {
        const res = await app.request('/api/users/user-2', {}, {} as Env);

        expect(res.status).toBe(200);
        expect(await res.json()).toMatchObject({
            user: { id: 'user-2' },
            sessions: [{ id: 'session-2', token: 'token-2' }],
        });
        expect(getUserMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            query: { id: 'user-2' },
        });
        expect(listUserSessionsMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            body: { userId: 'user-2' },
        });
    });

    it('ロール変更を Admin Plugin に委譲する', async () => {
        const res = await app.request(
            '/api/users/user-2/role',
            {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ role: 'manager' }),
            },
            {} as Env
        );

        expect(res.status).toBe(200);
        expect(setRoleMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            body: { userId: 'user-2', role: 'manager' },
        });
    });
});

describe('Users API mutations', () => {
    it('BAN / BAN解除 / 削除 / セッション失効を Admin Plugin に委譲する', async () => {
        const banRes = await app.request(
            '/api/users/user-2/ban',
            {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ banReason: 'policy' }),
            },
            {} as Env
        );
        const unbanRes = await app.request(
            '/api/users/user-2/unban',
            { method: 'POST' },
            {} as Env
        );
        const revokeRes = await app.request(
            '/api/users/user-2/sessions/revoke',
            {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ sessionToken: 'token-2' }),
            },
            {} as Env
        );
        const deleteRes = await app.request(
            '/api/users/user-2',
            { method: 'DELETE' },
            {} as Env
        );

        expect(banRes.status).toBe(200);
        expect(unbanRes.status).toBe(200);
        expect(revokeRes.status).toBe(200);
        expect(deleteRes.status).toBe(200);
        expect(banUserMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            body: {
                userId: 'user-2',
                banReason: 'policy',
                banExpiresIn: undefined,
            },
        });
        expect(unbanUserMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            body: { userId: 'user-2' },
        });
        expect(revokeUserSessionMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            body: { sessionToken: 'token-2' },
        });
        expect(removeUserMock).toHaveBeenCalledWith({
            headers: expect.any(Headers),
            body: { userId: 'user-2' },
        });
    });

    it('権限がない場合は Admin Plugin の処理を呼び出さない', async () => {
        userHasPermissionMock.mockResolvedValue({ success: false });

        const res = await app.request('/api/users', {}, {} as Env);

        expect(res.status).toBe(403);
        expect(listUsersMock).not.toHaveBeenCalled();
    });
});
