import express, { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';

const router = express.Router();

router.post(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const { dishId, name, price, quantity, restaurantId } = req.body;

        console.log('Cart POST received:', req.body);

        return res.json({
            status: 'ok',
            data: { dishId, name, price, quantity, restaurantId },
        });
    })
);

router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        return res.json({
            status: 'ok',
            data: [],
        });
    })
);
export default router;
