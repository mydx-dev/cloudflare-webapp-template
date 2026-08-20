import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { AuthPermission } from '../../../shared/auth/accessControl';
import { useCheckPermission } from '../../hooks/useCheckPermission';

type PermissionGuardProps = {
    children: ReactNode;
    fallback?: ReactNode;
    permission: AuthPermission;
    redirectTo?: string;
};

export const PermissionGuard = ({
    children,
    fallback = null,
    permission,
    redirectTo,
}: PermissionGuardProps) => {
    const hasPermission = useCheckPermission(permission);

    if (hasPermission) {
        return children;
    }

    if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
    }

    return fallback;
};
