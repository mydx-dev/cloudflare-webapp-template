import { describe, expect, it, vi } from 'vitest';
import { InvitationExpiredError } from '../../domain/invitation/Invitation.errors';
import { InvitationToken } from '../../domain/invitation/InvitationToken';
import { AuthAccount } from '../../infrastructure/auth/AuthAccount';
import { invitationMap } from '../../infrastructure/domainMap/invitationMap';
import type { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { ApplicationError } from '../dto/ApplicationError';
import { AcceptInvitationUseCase } from './AcceptInvitationUseCase';

describe('招待承認', () => {
    it('招待内容からユーザーを作成し、承認済みの招待を保存する', async () => {
        const plainToken = 'valid-token';
        const hashedToken = await new InvitationToken(plainToken, false).hash();
        const invitation = invitationMap.toDomain({
            id: 'invitation-id',
            email: 'invitee@example.com',
            createdAt: new Date(),
            role: 'user',
            inviterId: 'inviter-id',
            status: 'pending',
            token: hashedToken.value,
            expiredAt: new Date(Date.now() + 1000 * 60 * 60), // 1時間後に設定
        });
        const repository = {
            findByToken: vi.fn().mockResolvedValue(invitation),
            save: vi.fn().mockResolvedValue(undefined),
        };

        const createdUser = {
            id: 'user-id',
            email: 'invitee@example.com',
            name: 'Test User',
            role: 'user',
        };

        const createUser = vi.fn().mockResolvedValue({
            user: createdUser,
        });

        const authAccount = {
            ensure: vi.fn().mockImplementation(async (params) => {
                await createUser(params);
                return createdUser;
            }),
        };

        const useCase = new AcceptInvitationUseCase(
            repository as unknown as InvitationRepository,
            authAccount as unknown as AuthAccount
        );

        const result = await useCase.execute(
            'valid-token',
            'Test User',
            'password'
        );

        expect(createUser).toHaveBeenCalledWith({
            email: 'invitee@example.com',
            password: 'password',
            role: 'user',
            name: 'Test User',
        });

        expect(repository.save).toHaveBeenCalledWith(
            expect.objectContaining({
                id: invitation.id,
                status: expect.objectContaining({
                    value: 'accepted',
                }),
            })
        );

        expect(result).toBe(createdUser);
    });

    it('招待を承認できない場合はユーザーを作成しない', async () => {
        const expiredInvitation = invitationMap.toDomain({
            id: 'invitation-id',
            email: 'invitee@example.com',
            createdAt: new Date(),
            role: 'user',
            inviterId: 'inviter-id',
            status: 'pending',
            token: 'hashed-token',
            expiredAt: new Date(Date.now() - 1000 * 60 * 60), // 過去の日時に設定
        });
        const repository = {
            findByToken: vi.fn().mockResolvedValue(expiredInvitation),
            save: vi.fn(),
        };

        const createUser = vi.fn();

        const authAccount = {
            ensure: vi.fn().mockImplementation(async (params) => {
                await createUser(params);
                return { user: {} };
            }),
        };

        const useCase = new AcceptInvitationUseCase(
            repository as unknown as InvitationRepository,
            authAccount as unknown as AuthAccount
        );

        await expect(
            useCase.execute('valid-token', 'Test User', 'password')
        ).rejects.toThrow(
            new ApplicationError(new InvitationExpiredError(), [
                InvitationExpiredError,
            ])
        );

        expect(createUser).not.toHaveBeenCalled();
        expect(repository.save).not.toHaveBeenCalled();
    });

    it('ユーザー作成に失敗した場合は招待を承認済みとして保存しない', async () => {
        const token = new InvitationToken('valid-token', false);
        const hashedToken = await token.hash();
        const invitation = invitationMap.toDomain({
            id: 'invitation-id',
            email: 'invitee@example.com',
            role: 'user',
            inviterId: 'inviter-id',
            token: hashedToken.value,
            createdAt: new Date(),
            status: 'pending',
            expiredAt: new Date(Date.now() + 1000 * 60 * 60), // 1時間後に設定
        });
        const repository = {
            findByToken: vi.fn().mockResolvedValue(invitation),
            save: vi.fn(),
        };

        const createUser = vi
            .fn()
            .mockRejectedValue(new Error('User creation failed'));

        const authAccount = {
            ensure: vi.fn().mockImplementation(async (params) => {
                await createUser(params);
                return { user: {} };
            }),
        };

        const useCase = new AcceptInvitationUseCase(
            repository as unknown as InvitationRepository,
            authAccount as unknown as AuthAccount
        );

        await expect(
            useCase.execute('valid-token', 'Test User', 'password')
        ).rejects.toThrow('User creation failed');

        expect(repository.save).not.toHaveBeenCalled();
    });
});
