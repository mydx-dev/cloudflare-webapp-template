import { LogOut } from 'lucide-react';
import { appConfig } from '../../../shared/appConfig';
import { authClient } from '../../lib/authClient';
import { SidebarNavItem } from './SidebarNavItem';
import { navigations } from './navigations';

export const Sidebar = () => {
    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-full w-60 flex-col border-r border-border bg-card py-6 md:flex">
            <div className="mb-8 px-6">
                <p className="text-base font-bold text-foreground">
                    {appConfig.name}
                </p>
                <p className="text-xs font-semibold text-secondary"></p>
            </div>
            <nav className="flex flex-1 flex-col gap-1">
                {navigations.map((navigation) => (
                    <SidebarNavItem
                        key={navigation.to}
                        to={navigation.to}
                        icon={<navigation.icon className="size-4" />}
                        end
                    >
                        {navigation.label}
                    </SidebarNavItem>
                ))}
            </nav>
            <div className="border-t border-border px-4 pt-4">
                <button
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-semibold text-secondary hover:bg-muted/70"
                    type="button"
                    onClick={() => void authClient.signOut()}
                >
                    <LogOut className="size-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
};
