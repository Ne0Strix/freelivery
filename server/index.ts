import cors from 'cors';
import express, { Request, Response } from 'express';
import addressRoutes from './src/routes/address.routes.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, _res: Response, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Test endpoint
app.get('/api/test', (_req: Request, res: Response) => {
    res.json({
        message: 'Server is working!!!',
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
app.use('/api/addresses', addressRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
