import {
    Ban,
    ChevronRight,
    Eye,
    Search,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '../components/ui/spinner';
import {
    useAdminUsers,
    useDeleteAdminUser,
    useToggleAdminUserBan,
} from '../hooks/useAdminUsers';
import { AdminLayout } from '../layouts/admin/AdminLayout';
import type { AdminUser, UserStatusFilter } from '../lib/adminUsersClient';

const roleLabels: Record<string, string> = {
    admin: '管理者',
    manager: 'マネージャー',
    user: 'ユーザー',
};

const formatDate = (value: string) => {
    return new Intl.DateTimeFormat('ja-JP', {
        dateStyle: 'medium',
    }).format(new Date(value));
};

const getRoleLabel = (role: string | null | undefined) => {
    return (role || 'user')
        .split(',')
        .map((value) => roleLabels[value.trim()] ?? value.trim())
        .join(', ');
};

const getUserHandle = (user: AdminUser) => {
    return `@${user.email.split('@')[0]}`;
};

const UserAvatar = ({ user }: { user: AdminUser }) => {
    if (user.image) {
        return (
            <img
                alt=""
                className="size-10 rounded-lg border border-border object-cover"
                src={user.image}
            />
        );
    }

    return (
        <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-primary">
            <UserRound className="size-5" />
        </div>
    );
};

const UserStatusBadge = ({ banned }: { banned?: boolean | null }) => {
    if (banned) {
        return (
            <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
                <span className="size-1.5 rounded-full bg-red-500" />
                Banned
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Active
        </span>
    );
};

const UserRow = ({ user }: { user: AdminUser }) => {
    const toggleBan = useToggleAdminUserBan(user.id);
    const deleteUser = useDeleteAdminUser();
    const isMutating = toggleBan.isPending || deleteUser.isPending;

    const onToggleBan = async () => {
        const message = user.banned
            ? `${user.name} の BAN を解除しますか？`
            : `${user.name} を BAN しますか？`;

        if (!window.confirm(message)) {
            return;
        }

        await toggleBan.mutateAsync(Boolean(user.banned));
    };

    const onDelete = async () => {
        if (
            !window.confirm(
                `${user.name} を完全に削除します。この操作は取り消せません。`
            )
        ) {
            return;
        }

        await deleteUser.mutateAsync(user.id);
    };

    return (
        <tr className="group border-b border-border last:border-b-0 hover:bg-muted/50">
            <td className="min-w-64 px-6 py-4">
                <div className="flex items-center gap-3">
                    <UserAvatar user={user} />
                    <div>
                        <p className="font-semibold text-foreground">
                            {user.name}
                        </p>
                        <p className="text-xs text-secondary">
                            {getUserHandle(user)}
                        </p>
                    </div>
                </div>
            </td>
            <td className="min-w-64 px-6 py-4 text-sm text-secondary">
                {user.email}
            </td>
            <td className="px-6 py-4">
                <span className="rounded bg-muted px-2 py-1 text-xs font-bold text-primary">
                    {getRoleLabel(user.role)}
                </span>
            </td>
            <td className="px-6 py-4">
                <UserStatusBadge banned={user.banned} />
            </td>
            <td className="min-w-36 px-6 py-4 text-sm text-secondary">
                {formatDate(user.createdAt)}
            </td>
            <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                    <Link
                        aria-label={`${user.name} の詳細`}
                        className="rounded p-2 text-secondary transition-colors hover:bg-muted hover:text-primary"
                        to={`/users/${user.id}`}
                    >
                        <Eye className="size-4" />
                    </Link>
                    <button
                        aria-label={user.banned ? 'BAN解除' : 'BAN'}
                        className="rounded p-2 text-secondary transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                        type="button"
                        disabled={isMutating}
                        onClick={onToggleBan}
                    >
                        <Ban className="size-4" />
                    </button>
                    <button
                        aria-label="削除"
                        className="rounded p-2 text-secondary transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                        type="button"
                        disabled={isMutating}
                        onClick={onDelete}
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export const UserListPage = () => {
    const [searchText, setSearchText] = useState('');
    const [status, setStatus] = useState<UserStatusFilter>('all');
    const queryParams = useMemo(
        () => ({
            searchValue: searchText,
            status,
        }),
        [searchText, status]
    );
    const { data, error, isLoading, isFetching } = useAdminUsers(queryParams);

    return (
        <AdminLayout>
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            ユーザー管理
                        </h1>
                        <nav className="mt-1 flex items-center gap-1 text-sm text-secondary">
                            <span>Dashboard</span>
                            <ChevronRight className="size-3" />
                            <span className="font-semibold text-foreground">
                                Users
                            </span>
                        </nav>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <label className="relative">
                            <span className="sr-only">ユーザー検索</span>
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-secondary" />
                            <input
                                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none ring-primary/20 transition focus:ring-2 sm:w-72"
                                placeholder="名前またはメールで検索"
                                value={searchText}
                                onChange={(event) =>
                                    setSearchText(event.target.value)
                                }
                            />
                        </label>
                        <label>
                            <span className="sr-only">ステータス</span>
                            <select
                                className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        event.target.value as UserStatusFilter
                                    )
                                }
                            >
                                <option value="all">すべて</option>
                                <option value="active">Active</option>
                                <option value="banned">Banned</option>
                            </select>
                        </label>
                    </div>
                </div>

                <section className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="flex min-h-14 items-center justify-between border-b border-border bg-muted/40 px-6 py-3">
                        <p className="text-sm font-semibold text-secondary">
                            {data ? `${data.total} users` : 'Users'}
                        </p>
                        {isFetching && !isLoading ? <Spinner /> : null}
                    </div>
                    {isLoading ? (
                        <div className="flex min-h-64 items-center justify-center">
                            <Spinner className="size-6" />
                        </div>
                    ) : error ? (
                        <div className="p-6 text-sm font-semibold text-red-700">
                            {error.message}
                        </div>
                    ) : data?.users.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted/50 text-xs font-bold uppercase text-secondary">
                                    <tr>
                                        <th className="px-6 py-3">User Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">
                                            Joined Date
                                        </th>
                                        <th className="px-6 py-3 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.users.map((user) => (
                                        <UserRow key={user.id} user={user} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex min-h-64 items-center justify-center px-6 text-center text-sm text-secondary">
                            条件に一致するユーザーはいません。
                        </div>
                    )}
                </section>
            </main>
        </AdminLayout>
    );
};
