const DomainError = <const Message extends string>(message: Message) => {
    return class extends Error {
        public readonly message = message;

        constructor() {
            super(message);
            this.name = new.target.name;
        }
    };
};

export { DomainError };
