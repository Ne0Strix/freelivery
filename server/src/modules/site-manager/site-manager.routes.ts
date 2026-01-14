import express, { Request, Response } from 'express';
import { ValidationError } from '../../domains/commons/errors.js';
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

// GET /users - returns all users with roles
router.get(
    '/users',
    asyncHandler(async (_req: Request, res: Response) => {
        const users = await service.getAllUsers();
        return res.json({ status: 'ok', data: users });
    })
);

// PATCH /users/:id - partial user update
router.patch(
    '/users/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = Number(req.params.id);
        const adminUserId = (req as any).user?.sub;
        const { isActive } = req.body;

        // Handle isActive update (suspension)
        if (isActive !== undefined) {
            if (typeof isActive !== 'boolean') {
                throw new ValidationError('isActive must be a boolean');
            }
            await service.setUserActiveStatus(userId, isActive, adminUserId);
        }

        return res.json({
            status: 'ok',
            data: { message: 'User updated' },
        });
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

// POST /restaurants/:id/approve - approve a pending restaurant (admin only)
router.post(
    '/restaurants/:id/approve',
    asyncHandler(async (req: Request, res: Response) => {
        const restaurantId = Number(req.params.id);
        await service.approveRestaurant(restaurantId);
        return res.json({
            status: 'ok',
            data: { message: 'Restaurant approved' },
        });
    })
);

// DELETE /restaurants/:id - reject (delete) a pending restaurant (admin only)
router.delete(
    '/restaurants/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const restaurantId = Number(req.params.id);
        await service.rejectRestaurant(restaurantId);
        return res.json({
            status: 'ok',
            data: { message: 'Restaurant rejected' },
        });
    })
);

export default router;
