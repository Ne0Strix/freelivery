import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
    ForbiddenError,
    UnauthorizedError,
} from '../domains/commons/errors.js';

const getBearerToken = (authHeader: string | undefined): string | undefined => {
    if (!authHeader) return undefined;
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) return undefined;
    return token;
};

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
        const decoded = jwt.verify(token, secret);
        (req as any).user = decoded;
        return next();
    } catch {
        throw new UnauthorizedError('Invalid or expired token');
    }
};

export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const user = (req as any).user;
        const userRoles: string[] = user?.roles || [];

        if (!allowedRoles.some((role) => userRoles.includes(role))) {
            throw new ForbiddenError('Insufficient permissions');
        }

        return next();
    };
};
