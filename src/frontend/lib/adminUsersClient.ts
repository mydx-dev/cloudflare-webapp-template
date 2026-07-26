import type { AuthRole } from '../../shared/auth/accessControl';

export type AdminUser = {
    banExpires?: string | null;
    banReason?: string | null;
    banned?: boolean | null;
    createdAt: string;
    email: string;
    emailVerified: boolean;
    id: string;
    image?: string | null;
    name: string;
    role?: string | null;
    updatedAt: string;
};

export type AdminSession = {
    createdAt: string;
    expiresAt: string;
    id: string;
    impersonatedBy?: string | null;
    ipAddress?: string | null;
    token: string;
    updatedAt: string;
    userAgent?: string | null;
    userId: string;
};

export type AdminUsersResponse = {
    limit?: number;
    offset?: number;
    total: number;
    users: AdminUser[];
};

export type AdminUserDetailResponse = {
    sessions: AdminSession[];
    user: AdminUser;
};

export type UserStatusFilter = 'all' | 'active' | 'banned';

type ListAdminUsersParams = {
    searchValue?: string;
    searchField?: 'email' | 'name';
    status?: UserStatusFilter;
};

const adminUserApiErrorMessage = 'ユーザー管理 API の呼び出しに失敗しました。';

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
    const json = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            json &&
            typeof json === 'object' &&
            'message' in json &&
            typeof json.message === 'string'
                ? json.message
                : adminUserApiErrorMessage;
        throw new Error(message);
    }

    return json as T;
};

const adminFetch = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`/api${path}`, {
        credentials: 'include',
        headers: {
            'content-type': 'application/json',
            ...init?.headers,
        },
        ...init,
    });

    return parseJsonResponse<T>(response);
};

export const listAdminUsers = ({
    searchField = 'email',
    searchValue,
    status = 'all',
}: ListAdminUsersParams = {}) => {
    const normalizedSearch = searchValue?.trim();
    const resolvedSearchField =
        normalizedSearch && !normalizedSearch.includes('@')
            ? 'name'
            : searchField;
    const params = new URLSearchParams({
        limit: '50',
        offset: '0',
        searchField: resolvedSearchField,
    });

    if (normalizedSearch) {
        params.set('searchValue', normalizedSearch);
    }

    if (status !== 'all') {
        params.set('status', status);
    }

    return adminFetch<AdminUsersResponse>(`/users?${params.toString()}`);
};

export const getAdminUser = (userId: string) => {
    return adminFetch<AdminUserDetailResponse>(
        `/users/${encodeURIComponent(userId)}`
    );
};

export const setAdminUserRole = (userId: string, role: AuthRole) => {
    return adminFetch<{ user: AdminUser }>(
        `/users/${encodeURIComponent(userId)}/role`,
        {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        }
    );
};

export const banAdminUser = (userId: string) => {
    return adminFetch<{ user: AdminUser }>(
        `/users/${encodeURIComponent(userId)}/ban`,
        {
            method: 'POST',
            body: JSON.stringify({
                banReason: '管理者により停止されました',
            }),
        }
    );
};

export const unbanAdminUser = (userId: string) => {
    return adminFetch<{ user: AdminUser }>(
        `/users/${encodeURIComponent(userId)}/unban`,
        {
            method: 'POST',
            body: JSON.stringify({}),
        }
    );
};

export const deleteAdminUser = (userId: string) => {
    return adminFetch<{ success: boolean }>(
        `/users/${encodeURIComponent(userId)}`,
        {
            method: 'DELETE',
        }
    );
};

export const revokeAdminUserSession = (
    userId: string,
    sessionToken: string
) => {
    return adminFetch<{ success: boolean }>(
        `/users/${encodeURIComponent(userId)}/sessions/revoke`,
        {
            method: 'POST',
            body: JSON.stringify({ sessionToken }),
        }
    );
};
