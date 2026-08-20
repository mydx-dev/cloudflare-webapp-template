import type { AuthPermission, AuthRole } from '../../shared/auth/accessControl';
import { authClient } from '../lib/authClient';

export const useCheckPermission = (permission: AuthPermission) => {
    const session = authClient.useSession();
    const role = session.data?.user?.role as AuthRole;
    return authClient.admin.checkRolePermission({
        role: role ?? ('user' as const),
        permissions: permission,
    });
};
