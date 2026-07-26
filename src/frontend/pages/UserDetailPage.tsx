import type { AuthRole } from '../../shared/auth/accessControl';
import type { ReactNode } from 'react';
import {
    ArrowLeft,
    ChevronRight,
    Clock,
    Laptop,
    ShieldCheck,
    Trash2,
    UserRound,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Spinner } from '../components/ui/spinner';
import {
    useAdminUser,
    useDeleteAdminUser,
    useRevokeAdminUserSession,
    useSetAdminUserRole,
    useToggleAdminUserBan,
} from '../hooks/useAdminUsers';
import { AdminLayout } from '../layouts/admin/AdminLayout';
import type { AdminSession, AdminUser } from '../lib/adminUsersClient';

const roleOptions: Array<{ label: string; value: AuthRole }> = [
    { label: 'ユーザー', value: 'user' },
    { label: 'マネージャー', value: 'manager' },
    { label: '管理者', value: 'admin' },
];

const roleLabels: Record<AuthRole, string> = {
    admin: '管理者',
    manager: 'マネージャー',
    user: 'ユーザー',
};

const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat('ja-JP', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));

const getPrimaryRole = (role: string | null | undefined): AuthRole => {
    const primaryRole = (role || 'user').split(',')[0]?.trim();

    return primaryRole === 'admin' || primaryRole === 'manager'
        ? primaryRole
        : 'user';
};

const getMutationErrorMessage = (...errors: Array<Error | null>) =>
    errors.find(Boolean)?.message ?? null;

const ProfileAvatar = ({ user }: { user: AdminUser }) => {
    if (user.image) {
        return (
            <img
                alt=""
                className="size-20 rounded-lg border border-border object-cover"
                src={user.image}
            />
        );
    }

    return (
        <div className="flex size-20 items-center justify-center rounded-lg border border-border bg-muted text-primary">
            <UserRound className="size-9" />
        </div>
    );
};

const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
        <span className="text-xs font-bold uppercase text-secondary">
            {label}
        </span>
        <span className="text-right text-sm font-semibold text-foreground">
            {value}
        </span>
    </div>
);

const UserStatus = ({ user }: { user: AdminUser }) => {
    const className = user.banned
        ? 'rounded bg-red-50 px-2 py-1 text-xs font-bold text-red-700'
        : 'rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700';

    return (
        <span className={className}>{user.banned ? 'Banned' : 'Active'}</span>
    );
};

const UserDetailHeader = ({ user }: { user?: AdminUser }) => (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
            <Link
                aria-label="ユーザー一覧へ戻る"
                className="rounded-full border border-border p-2 text-secondary transition-colors hover:bg-muted hover:text-primary"
                to="/users"
            >
                <ArrowLeft className="size-4" />
            </Link>
            <div>
                <nav className="mb-1 flex items-center gap-1 text-sm text-secondary">
                    <Link className="hover:text-primary" to="/users">
                        Users
                    </Link>
                    <ChevronRight className="size-3" />
                    <span className="font-semibold text-foreground">
                        Detail
                    </span>
                </nav>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">
                        {user?.name ?? 'ユーザー詳細'}
                    </h1>
                    {user ? (
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">
                            {roleLabels[getPrimaryRole(user.role)]}
                        </span>
                    ) : null}
                </div>
            </div>
        </div>
    </div>
);

const UserProfileCard = ({
    isBanPending,
    isRolePending,
    onRoleChange,
    onToggleBan,
    user,
}: {
    isBanPending: boolean;
    isRolePending: boolean;
    onRoleChange: (role: AuthRole) => void;
    onToggleBan: () => void;
    user: AdminUser;
}) => (
    <section className="col-span-12 rounded-lg border border-border bg-card p-6 shadow-sm lg:col-span-5">
        <div className="mb-6 flex items-center gap-5">
            <ProfileAvatar user={user} />
            <div>
                <p className="text-sm font-bold text-foreground">
                    ID: {user.id}
                </p>
                <p className="mt-1 text-sm text-secondary">
                    登録日: {formatDateTime(user.createdAt)}
                </p>
            </div>
        </div>
        <div className="space-y-4">
            <DetailRow label="フルネーム" value={user.name} />
            <DetailRow label="メールアドレス" value={user.email} />
            <DetailRow label="ステータス" value={<UserStatus user={user} />} />
            {user.banned && user.banReason ? (
                <DetailRow label="BAN 理由" value={user.banReason} />
            ) : null}
        </div>
        <div className="mt-8 border-t border-border pt-6">
            <label
                className="mb-2 block text-xs font-bold uppercase text-secondary"
                htmlFor="user-role"
            >
                ロール変更
            </label>
            <select
                id="user-role"
                className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
                value={getPrimaryRole(user.role)}
                disabled={isRolePending}
                onChange={(event) =>
                    onRoleChange(event.target.value as AuthRole)
                }
            >
                {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                        {role.label}
                    </option>
                ))}
            </select>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-red-50 p-4">
            <div>
                <p className="text-sm font-bold text-red-800">
                    アクセス制限 (BAN)
                </p>
                <p className="text-xs text-red-700">
                    このユーザーのアカウントを即時停止します
                </p>
            </div>
            <button
                aria-label="アクセス制限 (BAN)"
                aria-pressed={Boolean(user.banned)}
                className={[
                    'relative h-7 w-12 rounded-full transition-colors disabled:opacity-40',
                    user.banned ? 'bg-red-600' : 'bg-secondary',
                ].join(' ')}
                type="button"
                disabled={isBanPending}
                onClick={onToggleBan}
            >
                <span
                    className={[
                        'absolute top-1 size-5 rounded-full bg-white transition-transform',
                        user.banned ? 'translate-x-5' : 'translate-x-1',
                    ].join(' ')}
                />
            </button>
        </div>
    </section>
);

const SessionRow = ({
    isPending,
    onRevoke,
    session,
}: {
    isPending: boolean;
    onRevoke: (sessionToken: string) => void;
    session: AdminSession;
}) => (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/50">
        <td className="min-w-64 px-6 py-4">
            <div className="flex items-center gap-3">
                <Laptop className="size-5 text-secondary" />
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        {session.userAgent || 'Unknown device'}
                    </p>
                    <p className="text-xs text-secondary">
                        {session.id.slice(0, 12)}
                    </p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 text-sm text-secondary">
            {session.ipAddress || '-'}
        </td>
        <td className="min-w-44 px-6 py-4 text-sm text-secondary">
            {formatDateTime(session.updatedAt)}
        </td>
        <td className="px-6 py-4 text-right">
            <button
                className="rounded border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-40"
                type="button"
                disabled={isPending}
                onClick={() => onRevoke(session.token)}
            >
                Revoke
            </button>
        </td>
    </tr>
);

const SessionsCard = ({
    isPending,
    onRevoke,
    sessions,
}: {
    isPending: boolean;
    onRevoke: (sessionToken: string) => void;
    sessions: AdminSession[];
}) => (
    <section className="col-span-12 overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:col-span-7">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
            <div className="flex items-center gap-2">
                <Clock className="size-4 text-secondary" />
                <h2 className="font-bold text-foreground">最近のセッション</h2>
            </div>
            {isPending ? <Spinner /> : null}
        </div>
        {sessions.length ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 text-xs font-bold uppercase text-secondary">
                        <tr>
                            <th className="px-6 py-3">デバイス / OS</th>
                            <th className="px-6 py-3">IPアドレス</th>
                            <th className="px-6 py-3">最終アクセス</th>
                            <th className="px-6 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <SessionRow
                                key={session.id}
                                isPending={isPending}
                                session={session}
                                onRevoke={onRevoke}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="flex min-h-56 items-center justify-center px-6 text-center text-sm text-secondary">
                有効なセッションはありません。
            </div>
        )}
    </section>
);

const DangerZone = ({
    isPending,
    onDelete,
}: {
    isPending: boolean;
    onDelete: () => void;
}) => (
    <section className="rounded-lg border-2 border-red-100 bg-card p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
                <div className="mb-2 flex items-center gap-2 text-red-700">
                    <ShieldCheck className="size-4" />
                    <h2 className="font-bold">ユーザー削除</h2>
                </div>
                <p className="text-sm text-secondary">
                    ユーザーアカウントと関連するセッションを削除します。この操作は取り消せません。
                </p>
            </div>
            <button
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-40"
                type="button"
                disabled={isPending}
                onClick={onDelete}
            >
                <Trash2 className="size-4" />
                アカウントを完全に削除する
            </button>
        </div>
    </section>
);

export const UserDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, error, isLoading } = useAdminUser(id);
    const setRole = useSetAdminUserRole(id ?? '');
    const toggleBan = useToggleAdminUserBan(id ?? '');
    const deleteUser = useDeleteAdminUser();
    const revokeSession = useRevokeAdminUserSession(id ?? '');
    const user = data?.user;
    const mutationErrorMessage = getMutationErrorMessage(
        setRole.error,
        toggleBan.error,
        deleteUser.error,
        revokeSession.error
    );

    const onToggleBan = async () => {
        if (!user) return;
        const message = user.banned
            ? `${user.name} の BAN を解除しますか？`
            : `${user.name} を BAN しますか？`;
        if (window.confirm(message)) {
            await toggleBan.mutateAsync(Boolean(user.banned));
        }
    };

    const onDelete = async () => {
        if (!user) return;
        const confirmed = window.confirm(
            `${user.name} を完全に削除します。この操作は取り消せません。`
        );
        if (confirmed) {
            await deleteUser.mutateAsync(user.id);
            navigate('/users');
        }
    };

    const onRevokeSession = async (sessionToken: string) => {
        if (window.confirm('このセッションを失効しますか？')) {
            await revokeSession.mutateAsync(sessionToken);
        }
    };

    return (
        <AdminLayout>
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-6">
                <UserDetailHeader user={user} />
                {isLoading ? (
                    <div className="flex min-h-72 items-center justify-center rounded-lg border border-border bg-card">
                        <Spinner className="size-6" />
                    </div>
                ) : null}
                {error ? (
                    <section className="rounded-lg border border-border bg-card p-6 text-sm font-semibold text-red-700">
                        {error.message}
                    </section>
                ) : null}
                {user && data ? (
                    <>
                        <div className="grid grid-cols-12 gap-5">
                            <UserProfileCard
                                isBanPending={toggleBan.isPending}
                                isRolePending={setRole.isPending}
                                user={user}
                                onRoleChange={(role) =>
                                    void setRole.mutateAsync(role)
                                }
                                onToggleBan={onToggleBan}
                            />
                            <SessionsCard
                                isPending={revokeSession.isPending}
                                sessions={data.sessions}
                                onRevoke={onRevokeSession}
                            />
                        </div>
                        <DangerZone
                            isPending={deleteUser.isPending}
                            onDelete={onDelete}
                        />
                        {mutationErrorMessage ? (
                            <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
                                {mutationErrorMessage}
                            </p>
                        ) : null}
                    </>
                ) : null}
            </main>
        </AdminLayout>
    );
};
