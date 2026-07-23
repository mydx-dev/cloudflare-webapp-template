import { User } from '../../domain/user/User';
import { user } from '../../infrastructure/db/authSchema';
import { DomainTranslation } from './DomainTranslation';

export interface DomainMap {
    user: DomainTranslation<User, typeof user>;
}
