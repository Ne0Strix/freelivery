import express, { Request, Response } from 'express';
import { NotFoundError, ValidationError } from '../domains/commons/errors.js';
import {
    getRestaurantRepository,
    getUserRepository,
} from '../domains/commons/repository-registry.js';
import {
    AddressService,
    CreateAddress,
    UpdateAddress,
} from '../domains/location/address.service.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = express.Router();
const addressService = new AddressService();

// GET /user/:userId - returns all addresses for a given user id
router.get(
    '/user/:userId',
    asyncHandler(async (req: Request, res: Response) => {
        const userIdParam = req.params.userId;
        const userId = Number(userIdParam);

        if (!Number.isInteger(userId) || userId <= 0) {
            throw new ValidationError('Invalid userId parameter');
        }

        const addresses = await addressService.getAllForUser(userId);
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
        const gridX = addressService.validateGridCoordinate(
            req.body.gridX,
            'gridX'
        );
        const gridY = addressService.validateGridCoordinate(
            req.body.gridY,
            'gridY'
        );

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

        const userRepo = getUserRepository();

        const addressId = await addressService.createAddress(dto);

        // Link address to user
        await userRepo.linkUserAddress(userId, addressId);

        return res.status(201).json({
            status: 'ok',
            data: { addressId },
        });
    })
);

// GET /restaurant - Get the restaurant address for the authenticated owner
// NOTE: Must be defined BEFORE /:addressId routes to avoid "restaurant" being matched as a parameter
router.get(
    '/restaurant',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.sub;
        const restaurantRepo = getRestaurantRepository();
        const restaurant = await restaurantRepo.findByOwnerId(userId);

        if (!restaurant) {
            throw new NotFoundError('No restaurant found for this user');
        }

        const address = await addressService.getById(restaurant.address_id);

        if (!address) {
            throw new NotFoundError('Restaurant address not found');
        }

        return res.json({ status: 'ok', data: address });
    })
);

// PUT /restaurant - Update the restaurant address for the authenticated owner
router.put(
    '/restaurant',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = (req as any).user.sub;
        const restaurantRepo = getRestaurantRepository();
        const restaurant = await restaurantRepo.findByOwnerId(userId);

        if (!restaurant) {
            throw new NotFoundError('No restaurant found for this user');
        }

        // Validate grid coordinates if provided
        const gridX = addressService.validateGridCoordinate(
            req.body.gridX,
            'gridX'
        );
        const gridY = addressService.validateGridCoordinate(
            req.body.gridY,
            'gridY'
        );

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

        await addressService.updateAddress(userId, restaurant.address_id, dto);

        return res.json({
            status: 'ok',
            data: { message: 'Restaurant address updated' },
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

        // Validate grid coordinates if provided
        const gridX = addressService.validateGridCoordinate(
            req.body.gridX,
            'gridX'
        );
        const gridY = addressService.validateGridCoordinate(
            req.body.gridY,
            'gridY'
        );

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

        await addressService.updateAddress(userId, addressId, dto);

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

        await addressService.deleteAddress(userId, addressId);

        return res.json({
            status: 'ok',
            data: { message: 'Address deleted' },
        });
    })
);

export default router;
