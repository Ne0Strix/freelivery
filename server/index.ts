import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
    res.json({
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Freelivery API Server' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
