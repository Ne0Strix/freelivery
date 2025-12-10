import type { RequestHandler } from 'express';
import { NotFoundError } from '../commons/errors.js';

export const notFoundHandler: RequestHandler = (req) => {
    throw new NotFoundError('Route not found', { path: req.originalUrl });
};
