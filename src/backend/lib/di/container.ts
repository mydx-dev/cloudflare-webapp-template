import { Container } from '@inferdi/inferdi';
import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import { AcceptInvitationUseCase } from '../../application/usecase/AcceptInvitationUseCase';
import { BanUserUseCase } from '../../application/usecase/BanUserUseCase';
import { DeleteUserUseCase } from '../../application/usecase/DeleteUserUseCase';
import { DetailInvitationUseCase } from '../../application/usecase/DetailInvitationUseCase';
import { DetailUserUseCase } from '../../application/usecase/DetailUserUseCase';
import { ListInvitationUseCase } from '../../application/usecase/ListInvitationUseCase';
import { ListUserUseCase } from '../../application/usecase/ListUserUseCase';
import { NewInvitationUseCase } from '../../application/usecase/NewInvitationUseCase';
import { RevokeInvitationUseCase } from '../../application/usecase/RevokeInvitationUseCase';
import { RevokeUserSessionUseCase } from '../../application/usecase/RevokeUserSessionUseCase';
import { SetUserRoleUseCase } from '../../application/usecase/SetUserRoleUseCase';
import { UnbanUserUseCase } from '../../application/usecase/UnbanUserUseCase';
import { AuthAccount } from '../../infrastructure/auth/AuthAccount';
import { schema } from '../../infrastructure/db/database';
import { domainMap } from '../../infrastructure/domainMap/DomainMap';
import { InvitationMail } from '../../infrastructure/mail/InvitationMail';
import { InvitationRepository } from '../../infrastructure/repository/InvitationRepository';
import { auth } from '../auth/auth';

const baseContainer = new Container()
    .registerValue('db', drizzle(env.DB, { schema }))
    .registerValue('auth', auth)
    .registerValue('sendEmail', env.EMAIL)
    .registerValue('baseUrl', new URL(env.BETTER_AUTH_URL).origin);

export const container = baseContainer
    .registerValue('dm', domainMap)
    .registerClass(
        'invitationMail',
        InvitationMail,
        ['sendEmail', 'baseUrl'],
        'scoped'
    )
    .registerClass(
        'invitationRepository',
        InvitationRepository,
        ['db', 'dm'],
        'scoped'
    )
    .registerClass('authAccount', AuthAccount, ['auth'], 'scoped')
    .registerClass('listUserUseCase', ListUserUseCase, ['auth'], 'scoped')
    .registerClass('detailUserUseCase', DetailUserUseCase, ['auth'], 'scoped')
    .registerClass('setUserRoleUseCase', SetUserRoleUseCase, ['auth'], 'scoped')
    .registerClass('banUserUseCase', BanUserUseCase, ['auth'], 'scoped')
    .registerClass('unbanUserUseCase', UnbanUserUseCase, ['auth'], 'scoped')
    .registerClass('deleteUserUseCase', DeleteUserUseCase, ['auth'], 'scoped')
    .registerClass(
        'revokeUserSessionUseCase',
        RevokeUserSessionUseCase,
        ['auth'],
        'scoped'
    )
    .registerClass(
        'createInvitationUseCase',
        NewInvitationUseCase,
        ['invitationRepository', 'invitationMail'],
        'scoped'
    )
    .registerClass(
        'listInvitationUseCase',
        ListInvitationUseCase,
        ['db', 'dm'],
        'scoped'
    )
    .registerClass(
        'detailInvitationUseCase',
        DetailInvitationUseCase,
        ['db'],
        'scoped'
    )
    .registerClass(
        'acceptInvitationUseCase',
        AcceptInvitationUseCase,
        ['invitationRepository', 'authAccount'],
        'scoped'
    )
    .registerClass(
        'revokeInvitationUseCase',
        RevokeInvitationUseCase,
        ['invitationRepository'],
        'scoped'
    );
