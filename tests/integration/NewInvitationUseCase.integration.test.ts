import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import { describe, expect, it, vi } from 'vitest';
import { NewInvitationUseCase } from '../../src/backend/application/usecase/NewInvitationUseCase';
import { schema } from '../../src/backend/infrastructure/db/database';
import { domainMap } from '../../src/backend/infrastructure/domainMap/DomainMap';
import { InvitationMail } from '../../src/backend/infrastructure/mail/InvitationMail';
import { InvitationRepository } from '../../src/backend/infrastructure/repository/InvitationRepository';
import { auth } from '../../src/backend/lib/auth/auth.mock';

describe('NewInvitationUseCase integration', () => {
    describe('新規ユーザー招待', () => {
        it('作成した招待を保存し、同じドメイン情報として復元できる', async () => {
            const db = drizzle(env.DB, { schema });
            const authContext = await auth.$context;
            const test = authContext.test;

            // 管理者ユーザーを直接テストDBへ作成
            const adminUser = test.createUser({
                id: 'admin-user-id',
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
            });

            await test.saveUser(adminUser);

            const invitationRepository = new InvitationRepository(
                db,
                domainMap
            );
            const invitationMail = {
                send: vi.fn().mockResolvedValue(undefined),
            } as unknown as InvitationMail;

            const useCase = new NewInvitationUseCase(
                invitationRepository,
                invitationMail
            );

            const result = await useCase.execute(
                'admin-user-id',
                'invitee@example.com',
                'admin'
            );

            const saved = await invitationRepository.findById(result.id);

            expect(saved.id).toBe(result.id);
            expect(saved.inviter.id).toBe('admin-user-id');
            expect(saved.invitee.value).toBe('invitee@example.com');
            expect(saved.role.value).toBe('admin');
            expect(saved.status.value).toBe('pending');
            expect(saved.acceptedAt).toBeNull();
            expect(saved.revokedAt).toBeNull();

            expect(invitationMail.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: result.id,
                })
            );
        });
    });
});
