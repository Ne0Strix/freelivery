import type { NextFunction, Request, Response } from 'express';

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const startMs = Date.now();

    res.on('finish', () => {
        const durationMs = Date.now() - startMs;
        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
        );
    });

    next();
};
