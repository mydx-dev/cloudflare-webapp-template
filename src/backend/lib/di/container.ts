import { Container } from '@inferdi/inferdi';
import type { drizzle } from 'drizzle-orm/d1';
import { BanUserUseCase } from '../../application/usecase/BanUserUseCase';
import { DeleteUserUseCase } from '../../application/usecase/DeleteUserUseCase';
import { DetailUserUseCase } from '../../application/usecase/DetailUserUseCase';
import { ListUserUseCase } from '../../application/usecase/ListUserUseCase';
import { RevokeUserSessionUseCase } from '../../application/usecase/RevokeUserSessionUseCase';
import { SetUserRoleUseCase } from '../../application/usecase/SetUserRoleUseCase';
import { UnbanUserUseCase } from '../../application/usecase/UnbanUserUseCase';
import type { createAuth } from '../../lib/auth/createAuth';

const baseContainer = new Container()
    .registerValue('db', undefined as unknown as ReturnType<typeof drizzle>)
    .registerValue(
        'auth',
        undefined as unknown as ReturnType<typeof createAuth>
    );

export const container = baseContainer
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
    );
