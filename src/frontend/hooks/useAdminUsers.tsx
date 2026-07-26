import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AuthRole } from '../../shared/auth/accessControl';
import {
    banAdminUser,
    deleteAdminUser,
    getAdminUser,
    listAdminUsers,
    revokeAdminUserSession,
    setAdminUserRole,
    unbanAdminUser,
    type UserStatusFilter,
} from '../lib/adminUsersClient';

type UseAdminUsersParams = {
    searchValue?: string;
    status?: UserStatusFilter;
};

export const adminUsersQueryKeys = {
    all: ['admin-users'] as const,
    detail: (userId: string) => ['admin-users', userId] as const,
    list: ({ searchValue = '', status = 'all' }: UseAdminUsersParams) =>
        ['admin-users', 'list', { searchValue, status }] as const,
};

export const useAdminUsers = (params: UseAdminUsersParams = {}) => {
    return useQuery({
        queryKey: adminUsersQueryKeys.list(params),
        queryFn: () =>
            listAdminUsers({
                searchValue: params.searchValue,
                status: params.status,
            }),
    });
};

export const useAdminUser = (userId: string | undefined) => {
    return useQuery({
        enabled: Boolean(userId),
        queryKey: adminUsersQueryKeys.detail(userId ?? ''),
        queryFn: () => getAdminUser(userId ?? ''),
    });
};

export const useSetAdminUserRole = (userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (role: AuthRole) => setAdminUserRole(userId, role),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: adminUsersQueryKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: adminUsersQueryKeys.detail(userId),
                }),
            ]);
        },
    });
};

export const useToggleAdminUserBan = (userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (banned: boolean) =>
            banned ? unbanAdminUser(userId) : banAdminUser(userId),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: adminUsersQueryKeys.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: adminUsersQueryKeys.detail(userId),
                }),
            ]);
        },
    });
};

export const useDeleteAdminUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAdminUser,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: adminUsersQueryKeys.all,
            });
        },
    });
};

export const useRevokeAdminUserSession = (userId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionToken: string) =>
            revokeAdminUserSession(userId, sessionToken),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: adminUsersQueryKeys.detail(userId),
            });
        },
    });
};
