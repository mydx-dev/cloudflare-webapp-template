import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';

type SidebarNavItemProps = {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    end?: boolean;
};

export const SidebarNavItem = ({
    to,
    icon,
    children,
    end,
}: SidebarNavItemProps) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    'mx-2 flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
                    isActive
                        ? 'bg-muted text-primary'
                        : 'text-secondary hover:bg-muted/70 hover:text-foreground'
                )
            }
            end={end}
        >
            {icon}

            <span>{children}</span>
        </NavLink>
    );
};
