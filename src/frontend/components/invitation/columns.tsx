'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { type DataTableFeatures } from '../ui/data-table-features';
import { InvitationActions } from './InvitationActions';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { InvitationViewModel } from '@/viewModel/InvitationViewModel';
import { InvitationStatusBadge } from './InvitationStatusBadge';

// Use `accessor` for data columns and `display` for columns without one.
const columnHelper = createColumnHelper<
    DataTableFeatures,
    InvitationViewModel
>();

export const columns = columnHelper.columns([
    columnHelper.accessor('inviteeEmail', {
        header: 'メールアドレス',
    }),
    columnHelper.accessor('role', {
        header: 'ロール',
    }),
    columnHelper.accessor('status', {
        header: 'ステータス',
        cell: ({ getValue }) => {
            const status = getValue();

            return <InvitationStatusBadge status={status} />;
        },
    }),
    columnHelper.accessor('createdAt', {
        header: '招待日時',
    }),
    columnHelper.accessor('expiredAt', {
        header: '有効期限',
    }),
    columnHelper.display({
        id: 'actions',
        cell: ({ row }) => {
            const invitation = row.original;

            return <InvitationActions invitation={invitation} />;
        },
    }),
]);
