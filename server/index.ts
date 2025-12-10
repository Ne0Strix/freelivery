import cors from 'cors';
import express, { Request, Response } from 'express';
import { expressErrorHandler } from './src/commons/errors.js';
import { requireAuth } from './src/middleware/auth.js';
import { requestLogger } from './src/middleware/logger.js';
import { notFoundHandler } from './src/middleware/not-found.js';
import addressRoutes from './src/routes/address.routes.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Logging middleware
app.use(requestLogger);

// Test endpoint
app.get('/api/test', (_req: Request, res: Response) => {
    res.json({
        message: 'Server is working!!! Yay!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Freelivery API Server' });
});

// Address routes
app.use('/api', requireAuth);
app.use('/api/addresses', addressRoutes);

// 404 + error handling (must be last)
app.use(notFoundHandler);
app.use(expressErrorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
