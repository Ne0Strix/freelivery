import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../commons/errors.js';

const getBearerToken = (authHeader: string | undefined): string | undefined => {
    if (!authHeader) return undefined;
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return undefined;
    return token;
};

// Simple token auth for now:
// - If `API_TOKEN` is unset, auth is effectively disabled (dev-friendly)
// - If set, requires `Authorization: Bearer <API_TOKEN>`
export const requireAuth = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const token = getBearerToken(req.header('authorization'));
    const secret = process.env.JWT_SECRET || 'dev-secret';

    if (!token) {
        throw new UnauthorizedError('Missing bearer token');
    }

    try {
        jwt.verify(token, secret);
        return next();
    } catch {
        throw new UnauthorizedError('Invalid or expired token');
    }
};
