import { Send, Users, type LucideIcon } from 'lucide-react';
import type { AuthPermission } from '../../../shared/auth/accessControl';
import { routes } from '../../../shared/routes';
import { useCheckPermission } from '../../hooks/useCheckPermission';

export interface NavigationItem {
    icon: LucideIcon;
    label: string;
    to: string;
    showable?: AuthPermission[];
}

export interface PrimaryAction {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
}

export const navigations: NavigationItem[] = [
    {
        icon: Users,
        label: 'ユーザー',
        to: routes.user.list,
        showable: [{ user: ['list'] }],
    },
    {
        icon: Send,
        label: '招待',
        to: routes.invitation.list,
    },
];

export const getNavigations = (): NavigationItem[] =>
    navigations.filter((navigation) => {
        if (!navigation.showable) return true;
        return navigation.showable.some((permission) => {
            return useCheckPermission(permission);
        });
    });

export const subNavigations: NavigationItem[] = [];

export const primaryActions: PrimaryAction[] = [];
