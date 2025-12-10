import express, { Request, Response } from 'express';
import { AddressRepository } from '../location/address.repository.js';
import { AddressService } from '../location/address.service.js';

const router = express.Router();

// GET /user/:userId - returns all addresses for a given user id
router.get('/user/:userId', async (req: Request, res: Response) => {
    const userIdParam = req.params.userId;
    const userId = Number(userIdParam);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid userId parameter' });
    }

    try {
        const service = new AddressService(new AddressRepository());
        const addresses = await service.getAllForUser(userId);
        return res.json(addresses);
    } catch (err: any) {
        console.error('Error fetching addresses for user', userId, err);
        return res.status(500).json({ error: 'Failed to fetch addresses' });
    }
});

export default router;
