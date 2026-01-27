import type { RequestHandler } from 'express';

/**
 * Wraps async route handlers to automatically catch errors and pass them to Express error middleware.
 * Eliminates the need for try-catch blocks in every async route.
 * [Source](https://www.w3tutorials.net/blog/what-does-express-async-handler-do/)
 */
export const asyncHandler = (handler: RequestHandler): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};
