import express, { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { SiteManagerService } from './site-manager.service.js';

const router = express.Router();
const service = new SiteManagerService();

// GET /statistics - returns platform-wide statistics (admin only)
router.get(
    '/statistics',
    asyncHandler(async (_req: Request, res: Response) => {
        const statistics = await service.getDashboardStatistics();
        return res.json({ status: 'ok', data: statistics });
    })
);

// GET /restaurants/pending - returns pending restaurant registrations (admin only)
router.get(
    '/restaurants/pending',
    asyncHandler(async (_req: Request, res: Response) => {
        const restaurants = await service.getPendingRestaurants();
        return res.json({ status: 'ok', data: restaurants });
    })
);

export default router;
