import express, { Request, Response } from 'express';
import { ForbiddenError, ValidationError } from '../domains/commons/errors.js';
import { AddressRepository } from '../domains/location/address.repository.js';
import {
    AddressService,
    CreateAddress,
    UpdateAddress,
} from '../domains/location/address.service.js';
import { RestaurantRepository } from '../domains/restaurant/restaurant.repository.js';
import { UserRepository } from '../domains/user/user.repository.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = express.Router();

/** Validate grid coordinate is within -10 to +10 range */
function validateGridCoordinate(
    value: unknown,
    fieldName: string
): number | undefined {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    const num = Number(value);
    if (!Number.isInteger(num) || num < -10 || num > 10) {
        throw new ValidationError(
            `${fieldName} must be an integer between -10 and 10`
        );
    }
    return num;
}

/**
 * Check if user owns an address - either directly (user_address link)
 * or via restaurant ownership
 */
async function userCanAccessAddress(
    userId: number,
    addressId: number,
    userRepo: UserRepository,
    restaurantRepo: RestaurantRepository
): Promise<boolean> {
    // Check direct ownership via user_address
    const ownsDirectly = await userRepo.userOwnsAddress(userId, addressId);
    if (ownsDirectly) return true;

    // Check ownership via restaurant
    const restaurant = await restaurantRepo.findByOwnerId(userId);
    if (restaurant && restaurant.address_id === addressId) return true;

    return false;
}

// GET /user/:userId - returns all addresses for a given user id
router.get(
    '/user/:userId',
    asyncHandler(async (req: Request, res: Response) => {
        const userIdParam = req.params.userId;
        const userId = Number(userIdParam);

        if (!Number.isInteger(userId) || userId <= 0) {
            throw new ValidationError('Invalid userId parameter');
        }

        const service = new AddressService(new AddressRepository());
        const addresses = await service.getAllForUser(userId);
        return res.json({ status: 'ok', data: addresses });
    })
);

// POST / - create a new address for the authenticated user
router.post(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.sub;
        const { streetName, houseNumber, cityName, zipCode, country } =
            req.body;

        // Validate required fields
        if (!streetName || !houseNumber || !cityName || !zipCode || !country) {
            throw new ValidationError(
                'streetName, houseNumber, cityName, zipCode, and country are required'
            );
        }

        // Validate grid coordinates
        const gridX = validateGridCoordinate(req.body.gridX, 'gridX');
        const gridY = validateGridCoordinate(req.body.gridY, 'gridY');

        const dto: CreateAddress = {
            label: req.body.label,
            streetName,
            houseNumber,
            additionalInfo: req.body.additionalInfo,
            cityName,
            zipCode,
            country,
            gridX,
            gridY,
        };

        const addressRepo = new AddressRepository();
        const userRepo = new UserRepository();
        const service = new AddressService(addressRepo);

        const addressId = await service.createAddress(dto);

        // Link address to user
        await userRepo.linkUserAddress(userId, addressId);

        return res.status(201).json({
            status: 'ok',
            data: { addressId },
        });
    })
);

// PUT /:addressId - update an existing address (only if user owns it)
router.put(
    '/:addressId',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.sub;
        const addressId = Number(req.params.addressId);

        if (!Number.isInteger(addressId) || addressId <= 0) {
            throw new ValidationError('Invalid addressId parameter');
        }

        const userRepo = new UserRepository();
        const restaurantRepo = new RestaurantRepository();

        // Check if user owns this address (directly or via restaurant)
        const canAccess = await userCanAccessAddress(
            userId,
            addressId,
            userRepo,
            restaurantRepo
        );
        if (!canAccess) {
            throw new ForbiddenError(
                'You do not have permission to update this address'
            );
        }

        // Validate grid coordinates if provided
        const gridX = validateGridCoordinate(req.body.gridX, 'gridX');
        const gridY = validateGridCoordinate(req.body.gridY, 'gridY');

        const dto: UpdateAddress = {
            label: req.body.label,
            streetName: req.body.streetName,
            houseNumber: req.body.houseNumber,
            additionalInfo: req.body.additionalInfo,
            cityName: req.body.cityName,
            zipCode: req.body.zipCode,
            country: req.body.country,
            gridX,
            gridY,
        };

        const service = new AddressService(new AddressRepository());
        await service.updateAddress(addressId, dto);

        return res.json({
            status: 'ok',
            data: { message: 'Address updated' },
        });
    })
);

// DELETE /:addressId - delete an address (only if user owns it)
router.delete(
    '/:addressId',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.sub;
        const addressId = Number(req.params.addressId);

        if (!Number.isInteger(addressId) || addressId <= 0) {
            throw new ValidationError('Invalid addressId parameter');
        }

        const userRepo = new UserRepository();
        const addressRepo = new AddressRepository();

        // Check if user owns this address
        const ownsAddress = await userRepo.userOwnsAddress(userId, addressId);
        if (!ownsAddress) {
            throw new ForbiddenError(
                'You do not have permission to delete this address'
            );
        }

        // Unlink address from user
        await userRepo.unlinkUserAddress(userId, addressId);

        // Delete the address itself
        await addressRepo.deleteById(addressId);

        return res.json({
            status: 'ok',
            data: { message: 'Address deleted' },
        });
    })
);

// GET /restaurant - Get the restaurant address for the authenticated owner
router.get(
    '/restaurant',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.sub;
        const restaurantRepo = new RestaurantRepository();
        const restaurant = await restaurantRepo.findByOwnerId(userId);

        if (!restaurant) {
            return res.status(404).json({
                status: 'error',
                error: 'No restaurant found for this user',
            });
        }

        const service = new AddressService(new AddressRepository());
        const address = await service.getById(restaurant.address_id);

        if (!address) {
            return res.status(404).json({
                status: 'error',
                error: 'Restaurant address not found',
            });
        }

        return res.json({ status: 'ok', data: address });
    })
);

// PUT /restaurant - Update the restaurant address for the authenticated owner
router.put(
    '/restaurant',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.sub;
        const restaurantRepo = new RestaurantRepository();
        const restaurant = await restaurantRepo.findByOwnerId(userId);

        if (!restaurant) {
            return res.status(404).json({
                status: 'error',
                error: 'No restaurant found for this user',
            });
        }

        // Validate grid coordinates if provided
        const gridX = validateGridCoordinate(req.body.gridX, 'gridX');
        const gridY = validateGridCoordinate(req.body.gridY, 'gridY');

        const dto: UpdateAddress = {
            label: req.body.label,
            streetName: req.body.streetName,
            houseNumber: req.body.houseNumber,
            additionalInfo: req.body.additionalInfo,
            cityName: req.body.cityName,
            zipCode: req.body.zipCode,
            country: req.body.country,
            gridX,
            gridY,
        };

        const service = new AddressService(new AddressRepository());
        await service.updateAddress(restaurant.address_id, dto);

        return res.json({
            status: 'ok',
            data: { message: 'Restaurant address updated' },
        });
    })
);

export default router;
