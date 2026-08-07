export class EmailAddress {
    constructor(public readonly value: string) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) {
            throw new Error('Invalid email address');
        }
    }
}
