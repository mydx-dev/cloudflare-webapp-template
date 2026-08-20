import {
    InvalidInvitationRoleError,
    InvalidInvitationTokenError,
    InvitationAlreadyAcceptedError,
    InvitationExpiredError,
    InvitationNotFoundError,
    InvitationRevokedError,
    InviterMismatchError,
} from '../../domain/invitation/Invitation.errors';

type ErrorConstructor = new (...args: any[]) => Error;

const applicationErrorMappings = [
    [InvitationNotFoundError, 'INVITATION_NOT_FOUND'],
    [InvalidInvitationTokenError, 'INVALID_INVITATION_TOKEN'],
    [InvalidInvitationRoleError, 'INVALID_INVITATION_ROLE'],
    [InvitationExpiredError, 'INVITATION_EXPIRED'],
    [InvitationRevokedError, 'INVITATION_REVOKED'],
    [InvitationAlreadyAcceptedError, 'INVITATION_ALREADY_ACCEPTED'],
    [InviterMismatchError, 'INVITER_MISMATCH'],
] as const;

type ApplicationErrorMapping = (typeof applicationErrorMappings)[number];

export type ApplicationErrorCode = ApplicationErrorMapping[1] | 'UNKNOWN';

type ApplicationErrorCodeOf<E extends Error> =
    ApplicationErrorMapping extends infer Mapping
        ? Mapping extends readonly [
              new (...args: any[]) => infer DomainError extends Error,
              infer Code extends ApplicationErrorCode,
          ]
            ? E extends DomainError
                ? Code
                : never
            : never
        : never;

export class ApplicationError<
    Errors extends readonly ErrorConstructor[],
> extends Error {
    public readonly code:
        ApplicationErrorCodeOf<InstanceType<Errors[number]>> | 'UNKNOWN';

    public constructor(error: unknown, errors: Errors) {
        super(error instanceof Error ? error.message : 'Unknown error', {
            cause: error,
        });

        this.name = new.target.name;

        if (!(error instanceof Error)) {
            this.code = 'UNKNOWN';
            return;
        }

        const isExpected = errors.some(
            (ErrorType) => error instanceof ErrorType
        );

        if (!isExpected) {
            this.code = 'UNKNOWN';
            return;
        }

        const mapping = applicationErrorMappings.find(
            ([ErrorType]) => error instanceof ErrorType
        );

        this.code =
            (mapping?.[1] as ApplicationErrorCodeOf<
                InstanceType<Errors[number]>
            >) ?? 'UNKNOWN';
    }

    public static codes<const Errors extends readonly ErrorConstructor[]>(
        errors: Errors
    ): ApplicationErrorCodeOf<InstanceType<Errors[number]>>[] {
        return applicationErrorMappings
            .filter(([ErrorType]) =>
                errors.some(
                    (ExpectedErrorType) => ErrorType === ExpectedErrorType
                )
            )
            .map(
                ([, code]) =>
                    code as ApplicationErrorCodeOf<InstanceType<Errors[number]>>
            );
    }
}
