import express, { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { CustomerService } from './customer.service.js';

const router = express.Router();
const service = new CustomerService();

router.get(
    '/restaurants/:restaurantId/menu',
    asyncHandler(async (req: Request, res: Response) => {
        const restaurantId = Number(req.params.restaurantId);
        const menuItems = await service.getMenuItemsByRestaurant(restaurantId);
        return res.json({ status: 'ok', data: menuItems });
    })
);

export default router;
