import { Router } from 'express';
import { RestaurantRepository } from '../domains/restaurant/restaurant.repository.js';
import {
    RestaurantService,
    UpdateRestaurantData,
} from '../domains/restaurant/restaurant.service.js';
import {
    UpdateProfileData,
    UserService,
} from '../domains/user/user.service.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();
const userService = new UserService();
const restaurantService = new RestaurantService(new RestaurantRepository());

/** GET /api/profile - Get current user's profile */
router.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = (req as any).user.sub;
        const profile = await userService.getProfile(userId);
        return res.json({ status: 'ok', data: profile });
    })
);

/** PUT /api/profile - Update current user's profile */
router.put(
    '/',
    asyncHandler(async (req, res) => {
        const userId = (req as any).user.sub;
        const data: UpdateProfileData = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            salutation: req.body.salutation,
            phoneNumber: req.body.phoneNumber,
            dateOfBirth: req.body.dateOfBirth
                ? new Date(req.body.dateOfBirth)
                : undefined,
        };

        await userService.updateProfile(userId, data);
        return res.json({ status: 'ok', data: { message: 'Profile updated' } });
    })
);

/** PUT /api/profile/password - Change password */
router.put(
    '/password',
    asyncHandler(async (req, res) => {
        const userId = (req as any).user.sub;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                error: 'Current password and new password are required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 'error',
                error: 'New password must be at least 6 characters',
            });
        }

        await userService.changePassword(userId, currentPassword, newPassword);
        return res.json({
            status: 'ok',
            data: { message: 'Password changed successfully' },
        });
    })
);

/** GET /api/profile/restaurant - Get owner's restaurant */
router.get(
    '/restaurant',
    asyncHandler(async (req, res) => {
        const userId = (req as any).user.sub;
        const restaurant = await restaurantService.getRestaurantByOwner(userId);

        if (!restaurant) {
            return res.status(404).json({
                status: 'error',
                error: 'No restaurant found for this user',
            });
        }

        return res.json({ status: 'ok', data: restaurant });
    })
);

/** PUT /api/profile/restaurant - Update owner's restaurant */
router.put(
    '/restaurant',
    asyncHandler(async (req, res) => {
        const userId = (req as any).user.sub;
        const restaurant = await restaurantService.getRestaurantByOwner(userId);

        if (!restaurant) {
            return res.status(404).json({
                status: 'error',
                error: 'No restaurant found for this user',
            });
        }

        // Validate maxDeliveryDistance if provided (1-20, max Manhattan distance on 21x21 grid)
        const maxDeliveryDistance = req.body.maxDeliveryDistance;
        if (maxDeliveryDistance !== undefined) {
            const num = Number(maxDeliveryDistance);
            if (!Number.isInteger(num) || num < 1 || num > 20) {
                return res.status(400).json({
                    status: 'error',
                    error: 'maxDeliveryDistance must be an integer between 1 and 20',
                });
            }
        }

        // Validate minOrderAmount if provided
        const minOrderAmount = req.body.minOrderAmount;
        if (minOrderAmount !== undefined) {
            const num = Number(minOrderAmount);
            if (isNaN(num) || num < 0) {
                return res.status(400).json({
                    status: 'error',
                    error: 'minOrderAmount must be a non-negative number',
                });
            }
        }

        const data: UpdateRestaurantData = {
            name: req.body.name,
            description: req.body.description,
            contactEmail: req.body.contactEmail,
            contactPhone: req.body.contactPhone,
            maxDeliveryDistance: maxDeliveryDistance
                ? Number(maxDeliveryDistance)
                : undefined,
            minOrderAmount:
                minOrderAmount !== undefined
                    ? Number(minOrderAmount)
                    : undefined,
        };

        await restaurantService.updateRestaurantDetails(
            restaurant.restaurantId,
            userId,
            data
        );

        return res.json({
            status: 'ok',
            data: { message: 'Restaurant updated' },
        });
    })
);

export default router;
