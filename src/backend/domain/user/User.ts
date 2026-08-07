import { AuthRole } from '../../../shared/auth/accessControl';
import { EmailAddress } from '../shared/EmailAddress';

interface UserProps {
    id: string;
    name: string;
    email: EmailAddress;
    role: AuthRole;
    isBanned: boolean;
}

export class User {
    public readonly id: string;
    public readonly name: string;
    public readonly email: EmailAddress;
    public readonly role: AuthRole;
    public readonly isBanned: boolean;

    constructor(props: UserProps) {
        this.id = props.id;
        this.name = props.name;
        this.email = props.email;
        this.role = props.role;
        this.isBanned = props.isBanned;
    }

    static create(
        name: string,
        email: EmailAddress,
        role: AuthRole = 'user'
    ): User {
        return new User({
            id: crypto.randomUUID(),
            name,
            email,
            role,
            isBanned: false,
        });
    }

    ban(): User {
        if (this.isBanned) {
            return this;
        }

        return new User({
            ...this,
            isBanned: true,
        });
    }

    unban(): User {
        if (!this.isBanned) {
            return this;
        }

        return new User({
            ...this,
            isBanned: false,
        });
    }

    changeRole(role: AuthRole): User {
        return new User({
            ...this,
            role,
        });
    }
}
