import express, { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { ValidationError } from '../commons/errors.js';
import { CategoryRepository, DishRepository } from './menu.repository.js';
import { MenuService } from './menu.service.js';
import { RestaurantRepository } from './restaurant.repository.js';
import { RestaurantService } from './restaurant.service.js';

const router = express.Router();

const menuService = new MenuService(
    new CategoryRepository(),
    new DishRepository(),
    new RestaurantRepository()
);

// GET /active - returns all active restaurants with stats (any authenticated user)
router.get(
    '/active',
    asyncHandler(async (_req: Request, res: Response) => {
        const service = new RestaurantService(new RestaurantRepository());
        const restaurants = await service.getActiveRestaurantsWithStats();
        return res.json({ status: 'ok', data: restaurants });
    })
);

// =====================
// Menu Reading Routes (by restaurantId)
// =====================

/** GET /:restaurantId/categories - List all categories for a restaurant */
router.get(
    '/:restaurantId/categories',
    asyncHandler(async (req: Request, res: Response) => {
        const restaurantId = Number(req.params.restaurantId);
        if (isNaN(restaurantId)) {
            throw new ValidationError('Invalid restaurant ID');
        }
        const categories =
            await menuService.getCategoriesByRestaurant(restaurantId);
        return res.json({ status: 'ok', data: categories });
    })
);

/** GET /:restaurantId/dishes - List all dishes for a restaurant */
router.get(
    '/:restaurantId/dishes',
    asyncHandler(async (req: Request, res: Response) => {
        const restaurantId = Number(req.params.restaurantId);
        if (isNaN(restaurantId)) {
            throw new ValidationError('Invalid restaurant ID');
        }
        const dishes = await menuService.getDishesByRestaurant(restaurantId);
        return res.json({ status: 'ok', data: dishes });
    })
);

export default router;
