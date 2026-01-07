import type { ErrorRequestHandler } from 'express';

type UnknownRecord = Record<string, unknown>;

export type AppErrorCode =
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'DB_ERROR'
    | 'INTERNAL_ERROR';

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: AppErrorCode;
    public readonly details?: UnknownRecord;
    public readonly expose: boolean;

    constructor(opts: {
        message: string;
        statusCode: number;
        code: AppErrorCode;
        details?: UnknownRecord;
        expose?: boolean;
        cause?: unknown;
    }) {
        super(opts.message);
        this.name = this.constructor.name;
        this.statusCode = opts.statusCode;
        this.code = opts.code;
        this.details = opts.details;
        this.expose = opts.expose ?? opts.statusCode < 500;

        if (opts.cause !== undefined) {
            // Node 20 supports `cause` on Error, but TS/emit differs by target;
            // keep it as a non-standard property for now.
            (this as unknown as { cause: unknown }).cause = opts.cause;
        }
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Invalid request', details?: UnknownRecord) {
        super({
            message,
            statusCode: 400,
            code: 'VALIDATION_ERROR',
            details,
        });
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', details?: UnknownRecord) {
        super({ message, statusCode: 401, code: 'UNAUTHORIZED', details });
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', details?: UnknownRecord) {
        super({ message, statusCode: 403, code: 'FORBIDDEN', details });
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Not found', details?: UnknownRecord) {
        super({ message, statusCode: 404, code: 'NOT_FOUND', details });
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflict', details?: UnknownRecord) {
        super({ message, statusCode: 409, code: 'CONFLICT', details });
    }
}

export class DatabaseError extends AppError {
    constructor(
        message = 'Database error',
        details?: UnknownRecord,
        cause?: unknown
    ) {
        super({
            message,
            statusCode: 500,
            code: 'DB_ERROR',
            details,
            expose: false,
            cause,
        });
    }
}

export class InternalError extends AppError {
    constructor(message = 'Internal server error', cause?: unknown) {
        super({
            message,
            statusCode: 500,
            code: 'INTERNAL_ERROR',
            expose: false,
            cause,
        });
    }
}

export const isAppError = (err: unknown): err is AppError =>
    err instanceof AppError;

const isObject = (v: unknown): v is UnknownRecord =>
    typeof v === 'object' && v !== null;

export const toAppError = (err: unknown): AppError => {
    if (isAppError(err)) return err;

    // Map common Postgres errors (from `pg`)
    // See: https://www.postgresql.org/docs/current/errcodes-appendix.html
    if (isObject(err) && typeof err.code === 'string') {
        const pgCode = err.code;

        // unique_violation
        if (pgCode === '23505') {
            return new ConflictError('Resource already exists', {
                pgCode,
                constraint:
                    typeof err.constraint === 'string'
                        ? err.constraint
                        : undefined,
            });
        }

        // foreign_key_violation
        if (pgCode === '23503') {
            return new ValidationError('Invalid reference', {
                pgCode,
                constraint:
                    typeof err.constraint === 'string'
                        ? err.constraint
                        : undefined,
            });
        }

        // invalid_text_representation (e.g. bad UUID/int)
        if (pgCode === '22P02') {
            return new ValidationError('Invalid value format', { pgCode });
        }

        return new DatabaseError('Database error', { pgCode }, err);
    }

    return new InternalError('Internal server error', err);
};

export const expressErrorHandler: ErrorRequestHandler = (
    err,
    _req,
    res,
    _next
) => {
    const appErr = toAppError(err);

    if (appErr.statusCode >= 500) {
        console.error(appErr);
    }

    return res.status(appErr.statusCode).json({
        error: {
            code: appErr.code,
            message: appErr.expose ? appErr.message : 'Internal server error',
            ...(appErr.expose && appErr.details
                ? { details: appErr.details }
                : {}),
        },
    });
};
