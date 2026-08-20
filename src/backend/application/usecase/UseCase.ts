import type { ApplicationErrorCode } from '../dto/ApplicationError';

export interface UseCase {
    readonly errorCodes: readonly ApplicationErrorCode[];
}
