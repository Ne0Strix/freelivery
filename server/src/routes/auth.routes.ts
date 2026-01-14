import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../domains/user/user.service.js';
import { ALL_ROLES } from '../middleware/auth.js';

const router = Router();
const userService = new UserService();

// Source: https://medium.com/@kevinpatrickboylan/using-jwt-authentication-and-bcrypt-net-with-angular-and-net-core-web-api-51aab1153778

router.post('/login', async (req, res) => {
    try {
        const { email, username, password } = req.body ?? {};
        if ((!email && !username) || !password) {
            return res
                .status(400)
                .json({ status: 'error', error: 'Missing credentials' });
        }

        const identifier = email ?? username;
        const byEmail = Boolean(email);

        // Find user (including inactive to check suspension status)
        const user = await userService.findUserIncludingInactive(
            identifier,
            byEmail
        );
        if (!user) {
            return res
                .status(401)
                .json({ status: 'error', error: 'Invalid credentials' });
        }

        // Check if user is suspended
        if (!user.is_active) {
            return res.status(403).json({
                status: 'error',
                error: 'Account suspended',
                code: 'ACCOUNT_SUSPENDED',
            });
        }

        // Verify password
        const isValidPassword = await userService.verifyPassword(
            password,
            user.password_hash
        );
        if (!isValidPassword) {
            return res
                .status(401)
                .json({ status: 'error', error: 'Invalid credentials' });
        }

        // Fetch user roles
        const roles = await userService.getUserRoles(user.user_id);

        const secret = process.env.JWT_SECRET || 'dev-secret';
        const token = jwt.sign(
            {
                sub: user.user_id,
                username: user.username,
                email: user.email,
                roles,
            },
            secret,
            { expiresIn: '1h' }
        );

        return res.json({ status: 'ok', data: { token } });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ status: 'error', error: 'Server error' });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            role,
            phoneNumber,
            address,
            restaurant,
        } = req.body ?? {};

        // Validate required fields
        if (!username || !email || !password || !role) {
            return res.status(400).json({
                status: 'error',
                error: 'Missing required fields: username, email, password, role',
            });
        }

        // Validate role
        if (!ALL_ROLES.includes(role)) {
            return res.status(400).json({
                status: 'error',
                error: `Invalid role. Must be one of: ${ALL_ROLES.join(', ')}`,
            });
        }

        // Build customer data if present
        let customerData;
        if (role === 'customer' && (phoneNumber || address)) {
            customerData = {
                phoneNumber,
                address: address
                    ? {
                          streetName: address.streetName,
                          houseNumber: address.houseNumber,
                          additionalInfo: address.additionalInfo,
                          cityName: address.cityName,
                          zipCode: address.zipCode,
                          country: address.country,
                      }
                    : undefined,
            };
        }

        // Build restaurant data if present
        let restaurantData;
        if (role === 'restaurant_owner' && restaurant) {
            if (
                !restaurant.name ||
                !restaurant.contactEmail ||
                !restaurant.contactPhone ||
                !restaurant.address
            ) {
                return res.status(400).json({
                    status: 'error',
                    error: 'Restaurant registration requires name, contact email, contact phone, and address',
                });
            }
            restaurantData = {
                name: restaurant.name,
                description: restaurant.description,
                cuisineType: restaurant.cuisineType || 'ITALIAN',
                contactEmail: restaurant.contactEmail,
                contactPhone: restaurant.contactPhone,
                address: {
                    streetName: restaurant.address.streetName,
                    houseNumber: restaurant.address.houseNumber,
                    additionalInfo: restaurant.address.additionalInfo,
                    cityName: restaurant.address.cityName,
                    zipCode: restaurant.address.zipCode,
                    country: restaurant.address.country,
                },
            };
        }

        // Create user via service
        const { userId } = await userService.createUser(
            username,
            email,
            password,
            role,
            customerData,
            restaurantData
        );

        return res.status(201).json({
            status: 'ok',
            data: { message: 'User created successfully', userId },
        });
    } catch (err: any) {
        console.error('Signup error:', err);

        // Handle known errors
        if (err.code === 'CONFLICT') {
            return res.status(409).json({
                status: 'error',
                error: err.message,
            });
        }

        return res.status(500).json({ status: 'error', error: 'Server error' });
    }
});

export default router;
