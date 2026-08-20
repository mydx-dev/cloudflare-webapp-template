import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import {
    ApplicationError,
    type ApplicationErrorCode,
} from '../../application/dto/ApplicationError';
import type { AppEnv } from '../../types/app-env';

type ErrorStatusMap<Codes extends readonly ApplicationErrorCode[]> = Partial<
    Record<Codes[number], ContentfulStatusCode>
>;

export const applicationErrorResponse = <
    const Codes extends readonly ApplicationErrorCode[],
>(
    error: unknown,
    c: Context<AppEnv>,
    errorCodes: Codes,
    statusMap: ErrorStatusMap<Codes>
) => {
    if (!(error instanceof ApplicationError)) {
        return;
    }

    if (error.code === 'UNKNOWN') {
        return;
    }

    if (!errorCodes.includes(error.code)) {
        return;
    }

    const code = error.code as Exclude<Codes[number], 'UNKNOWN'>;
    const status = statusMap[code];

    if (!status) {
        return;
    }

    return c.json(
        {
            code,
            message: error.message,
        },
        status
    );
};
