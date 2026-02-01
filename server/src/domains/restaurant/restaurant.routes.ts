import express, { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { CustomerService } from '../../modules/customer/customer.service.js';
import { ValidationError } from '../commons/errors.js';
import { MenuService } from './menu/menu.service.js';
import { RestaurantRepository } from './restaurant.repository.js';
import { RestaurantService } from './restaurant.service.js';

const router = express.Router();

const menuService = new MenuService();

// GET /active - returns all active restaurants with stats (any authenticated user)
router.get(
    '/active',
    asyncHandler(async (_req: Request, res: Response) => {
        const service = new RestaurantService();
        const restaurants = await service.getActiveRestaurantsWithStats();
        return res.json({ status: 'ok', data: restaurants });
    })
);

// =====================
// Menu Reading Routes (by restaurantId)
// =====================

// GET /: restaurantId- get restaurant details by Id
router.get(
    '/:restaurantId',
    asyncHandler(async (req: Request, res: Response) => {
        const restaurantId = Number(req.params.restaurantId);

        if (isNaN(restaurantId)) {
            throw new ValidationError('Invalid restaurant ID');
        }

        const repository = new RestaurantRepository();
        const restaurant = await repository.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                status: 'error',
                error: 'Restaurant not found',
            });
        }

        return res.json({
            status: 'ok',
            data: restaurant,
        });
    })
);

//GET /:restaurantId/menu- get menu items for each restaurant
router.get(
    '/:restaurantId/menu',
    asyncHandler(async (req: Request, res: Response) => {
        const restaurantId = Number(req.params.restaurantId);

        if (isNaN(restaurantId)) {
            throw new ValidationError('Invalid restaurant ID');
        }

        const restaurantRepo = new RestaurantRepository();
        const restaurant = await restaurantRepo.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                status: 'error',
                error: 'Restaurant not found',
            });
        }

        const customerService = new CustomerService();
        const menuItems =
            await customerService.getMenuItemsByRestaurant(restaurantId);

        return res.json({
            status: 'ok',
            data: menuItems,
        });
    })
);

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
