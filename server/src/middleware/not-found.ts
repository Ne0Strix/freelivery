import type { RequestHandler } from 'express';
import { NotFoundError } from '../domains/commons/errors.js';

export const notFoundHandler: RequestHandler = (req) => {
    throw new NotFoundError(`Route not found: ${req.originalUrl}`);
};
