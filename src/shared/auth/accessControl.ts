import { createAccessControl } from 'better-auth/plugins/access';

export const authAccessStatement = {
    session: ['list', 'revoke', 'delete'],
    user: [
        'read',
        'create',
        'list',
        'set-role',
        'ban',
        'impersonate',
        'impersonate-admins',
        'delete',
        'set-password',
        'set-email',
        'get',
        'update',
    ],
} as const;

export const authAccessControl = createAccessControl(authAccessStatement);

export const authAccessRoles = {
    user: authAccessControl.newRole({
        user: ['read'],
    }),
    manager: authAccessControl.newRole({
        user: ['read', 'get', 'update'],
    }),
    admin: authAccessControl.newRole({
        session: ['list', 'revoke', 'delete'],
        user: [
            'read',
            'create',
            'list',
            'set-role',
            'ban',
            'impersonate',
            'impersonate-admins',
            'delete',
            'set-password',
            'set-email',
            'get',
            'update',
        ],
    }),
} as const;

export type AuthRole = keyof typeof authAccessRoles;

export type AuthPermission = {
    [Resource in keyof typeof authAccessStatement]?: Array<
        (typeof authAccessStatement)[Resource][number]
    >;
};

export const checkRolePermission = (
    role: string | null | undefined,
    permissions: AuthPermission
) => {
    const roles = (role || 'user')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    return roles.some((roleName) => {
        const accessRole = authAccessRoles[roleName as AuthRole];
        return accessRole?.authorize(permissions).success === true;
    });
};
