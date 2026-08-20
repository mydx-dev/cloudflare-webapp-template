import type { Context } from 'hono';

type ValidationResult =
    | {
          success: true;
      }
    | {
          success: false;
          error: {
              issues: ReadonlyArray<{
                  path: ReadonlyArray<PropertyKey>;
                  message: string;
              }>;
          };
      };

export const validationErrorResponse = (
    result: ValidationResult,
    c: Context
) => {
    if (result.success) {
        return;
    }

    return c.json(
        {
            code: 'INVALID_INPUT' as const,
            message: result.error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            })),
        },
        422
    );
};
