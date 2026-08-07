import { vi } from 'vitest';

export const createUser = (overrides: Record<string, unknown> = {}) => ({
    id: 'user-2',
    name: 'Target User',
    email: 'target@example.com',
    emailVerified: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    image: null,
    role: 'user',
    banned: false,
    banReason: null,
    banExpires: null,
    ...overrides,
});

export const createAuthFake = () => ({
    api: {
        listUsers: vi.fn(),
        getUser: vi.fn(),
        listUserSessions: vi.fn(),
        setRole: vi.fn(),
        banUser: vi.fn(),
        unbanUser: vi.fn(),
        removeUser: vi.fn(),
        revokeUserSession: vi.fn(),
    },
});
