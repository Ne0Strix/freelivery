import express, { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { RestaurantRepository } from './restaurant.repository.js';
import { RestaurantService } from './restaurant.service.js';

const router = express.Router();

// GET /active - returns all active restaurants with stats (any authenticated user)
router.get(
    '/active',
    asyncHandler(async (_req: Request, res: Response) => {
        const service = new RestaurantService(new RestaurantRepository());
        const restaurants = await service.getActiveRestaurantsWithStats();
        return res.json({ status: 'ok', data: restaurants });
    })
);

export default router;
