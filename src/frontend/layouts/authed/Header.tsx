import { Bell, Users } from 'lucide-react';
import { appConfig } from '../../../shared/appConfig';
import { authClient } from '../../lib/authClient';

export const Header = () => {
    const session = authClient.useSession();
    const user = session.data?.user;
    const initial = user?.name?.[0] ?? user?.email?.[0] ?? 'A';
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
            <div className="flex items-center gap-3 md:hidden">
                <Users className="size-5 text-primary" />
                <span className="text-sm font-bold">{appConfig.name}</span>
            </div>
            <div className="hidden text-sm font-semibold text-secondary md:block"></div>
            <div className="flex items-center gap-3">
                <button
                    aria-label="通知"
                    className="rounded-full p-2 text-secondary hover:bg-muted"
                    type="button"
                >
                    <Bell className="size-4" />
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
    );
};
