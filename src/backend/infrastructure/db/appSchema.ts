import { sqliteTable } from 'drizzle-orm/sqlite-core';
import { integer, text } from 'drizzle-orm/sqlite-core/columns';
import { user } from './authSchema';

export const invitationTable = sqliteTable('invitation', {
    id: text('id').primaryKey(),
    inviterId: text('inviter_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role', {
        enum: ['user', 'admin', 'manager'],
    }).notNull(),
    status: text('status', {
        enum: ['pending', 'accepted', 'revoked'],
    }).notNull(),
    token: text('token').notNull().unique(),
    expiredAt: integer('expiration_date', {
        mode: 'timestamp_ms',
    }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    acceptedAt: integer('accepted_at', { mode: 'timestamp_ms' }),
    revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
});
