import type { ErrorRequestHandler } from 'express';

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
    /** Whether the error message should be exposed to client (false for 500s) */
    public readonly expose: boolean;

    constructor(message: string, statusCode: number, code: AppErrorCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.expose = statusCode < 500;
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Invalid request') {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

export class NotFoundError extends AppError {
    public readonly details?: Record<string, unknown>;

    constructor(message = 'Not found', details?: Record<string, unknown>) {
        super(message, 404, 'NOT_FOUND');
        this.details = details;
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409, 'CONFLICT');
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'Database error') {
        super(message, 500, 'DB_ERROR');
    }
}

export class InternalError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500, 'INTERNAL_ERROR');
    }
}

/**
 *
 * This function converts any error to an {@link AppError}.
 * If the error is already an AppError, it is returned as is.
 * Otherwise, it is wrapped in an {@link InternalError}.
 *
 * Needed so that the {@link expressErrorHandler} can handle all errors uniformly.
 *
 * @param err - Any error
 * @returns The error as an AppError; if it's not already one, wraps it in an InternalError.
 */
export const toAppError = (err: unknown): AppError => {
    if (err instanceof AppError) return err;
    console.error('Unhandled error:', err);
    return new InternalError();
};

/**
 * Implements the express interface for error handling middleware.
 */
export const expressErrorHandler: ErrorRequestHandler = (
    err,
    _req,
    res,
    _next
) => {
    const appErr = toAppError(err);

    return res.status(appErr.statusCode).json({
        error: {
            code: appErr.code,
            message: appErr.expose ? appErr.message : 'Internal server error',
        },
    });
};
