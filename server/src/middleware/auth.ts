import type { NextFunction, Request, Response } from 'express';
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
    const requiredToken = process.env.API_TOKEN;
    if (!requiredToken) return next();

    const token = getBearerToken(req.header('authorization'));
    if (!token || token !== requiredToken) {
        throw new UnauthorizedError('Missing or invalid bearer token');
    }

    return next();
};
