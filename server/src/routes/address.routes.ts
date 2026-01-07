import express, { Request, Response } from 'express';
import { ValidationError } from '../domains/commons/errors.js';
import { AddressRepository } from '../domains/location/address.repository.js';
import { AddressService } from '../domains/location/address.service.js';
import { asyncHandler } from '../middleware/async-handler.js';

const router = express.Router();

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
        return res.json(addresses);
    })
);

export default router;
