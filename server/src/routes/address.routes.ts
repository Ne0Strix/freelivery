import express, { Request, Response } from 'express';
import { ValidationError } from '../domains/commons/errors.js';
import { AddressRepository } from '../domains/location/address.repository.js';
import {
    AddressService,
    CreateAddress,
    UpdateAddress,
} from '../domains/location/address.service.js';
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

// PUT /:addressId - update an existing address
router.put(
    '/:addressId',
    asyncHandler(async (req: Request, res: Response) => {
        const addressId = Number(req.params.addressId);

        if (!Number.isInteger(addressId) || addressId <= 0) {
            throw new ValidationError('Invalid addressId parameter');
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

export default router;
