import cors from 'cors';
import express, { Request, Response } from 'express';
import { expressErrorHandler } from './src/domains/commons/errors.js';
import restaurantRoutes from './src/domains/restaurant/restaurant.routes.js';
import { requireAuth, requireRole } from './src/middleware/auth.js';
import { requestLogger } from './src/middleware/logger.js';
import { notFoundHandler } from './src/middleware/not-found.js';
import customerRoutes from './src/modules/customer/customer.routes.js';
import siteManagerRoutes from './src/modules/site-manager/site-manager.routes.js';
import addressRoutes from './src/routes/address.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import profileRoutes from './src/routes/profile.routes.js';

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
        status: 'ok',
        data: {
            message: 'Server is working!!! Yay!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
        },
    });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', data: { health: true } });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.json({ status: 'ok', data: { message: 'Freelivery API Server' } });
});

// ========== PUBLIC API ==========
app.use('/api/auth', authRoutes);

// ========== AUTHENTICATED (any logged-in user) ==========
app.use('/api/addresses', requireAuth, addressRoutes);
app.use('/api/restaurants', requireAuth, restaurantRoutes);
app.use('/api/profile', requireAuth, profileRoutes);
app.use(
    '/api/customer',
    requireAuth,
    requireRole(['customer']),
    customerRoutes
);

// ========== ADMIN ONLY (site-manager) ==========
app.use(
    '/api/site-manager',
    requireAuth,
    requireRole(['admin']),
    siteManagerRoutes
);

// 404 + error handling (must be last)
app.use(notFoundHandler);
app.use(expressErrorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
