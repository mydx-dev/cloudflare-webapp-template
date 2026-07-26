import { Bell, CircleHelp, Gauge, LogOut, Settings, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { authClient } from '../../lib/authClient';

type AdminLayoutProps = {
    children: ReactNode;
};

type SessionUser = {
    email?: string | null;
    image?: string | null;
    name?: string | null;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
        'mx-2 flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
        isActive
            ? 'bg-muted text-primary'
            : 'text-secondary hover:bg-muted/70 hover:text-foreground',
    ].join(' ');

export const AdminLayout = ({ children }: AdminLayoutProps) => {
    const session = authClient.useSession();
    const user = session.data?.user as SessionUser | undefined;
    const initial = user?.name?.[0] ?? user?.email?.[0] ?? 'A';

    return (
        <div className="min-h-screen bg-background text-foreground">
            <aside className="fixed left-0 top-0 z-40 hidden h-full w-60 flex-col border-r border-border bg-card py-6 md:flex">
                <div className="mb-8 px-6">
                    <p className="text-base font-bold text-foreground">
                        Enterprise Admin
                    </p>
                    <p className="text-xs font-semibold text-secondary">
                        Management Suite
                    </p>
                </div>
                <nav className="flex flex-1 flex-col gap-1">
                    <NavLink className={navLinkClass} to="/">
                        <Gauge className="size-4" />
                        Dashboard
                    </NavLink>
                    <NavLink className={navLinkClass} to="/users">
                        <Users className="size-4" />
                        Users
                    </NavLink>
                    <NavLink className={navLinkClass} to="/settings">
                        <Settings className="size-4" />
                        Settings
                    </NavLink>
                </nav>
                <div className="border-t border-border px-4 pt-4">
                    <button
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-semibold text-secondary hover:bg-muted/70"
                        type="button"
                    >
                        <CircleHelp className="size-4" />
                        Help Center
                    </button>
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
            <div className="md:pl-60">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
                    <div className="flex items-center gap-3 md:hidden">
                        <Users className="size-5 text-primary" />
                        <span className="text-sm font-bold">
                            Enterprise Admin
                        </span>
                    </div>
                    <div className="hidden text-sm font-semibold text-secondary md:block">
                        ユーザー管理
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            aria-label="通知"
                            className="rounded-full p-2 text-secondary hover:bg-muted"
                            type="button"
                        >
                            <Bell className="size-4" />
                        </button>
                        <button
                            aria-label="ヘルプ"
                            className="rounded-full p-2 text-secondary hover:bg-muted"
                            type="button"
                        >
                            <CircleHelp className="size-4" />
                        </button>
                        <div className="flex size-9 items-center justify-center rounded-full border border-border bg-muted text-sm font-bold text-primary">
                            {user?.image ? (
                                <img
                                    alt=""
                                    className="size-full rounded-full object-cover"
                                    src={user.image}
                                />
                            ) : (
                                initial.toUpperCase()
                            )}
                        </div>
                    </div>
                </header>
                {children}
            </div>
        </div>
    );
};
