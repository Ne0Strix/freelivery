import { Router } from 'express';
import jwt from 'jsonwebtoken';
import {
    ForbiddenError,
    UnauthorizedError,
    ValidationError,
} from '../domains/commons/errors.js';
import { RestaurantRepository } from '../domains/restaurant/restaurant.repository.js';
import {
    RestaurantService,
    RestaurantStatus,
} from '../domains/restaurant/restaurant.service.js';
import { UserService } from '../domains/user/user.service.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { ALL_ROLES, UserRole } from '../middleware/auth.js';

const router = Router();
const userService = new UserService();
const restaurantService = new RestaurantService(new RestaurantRepository());

// Source: https://medium.com/@kevinpatrickboylan/using-jwt-authentication-and-bcrypt-net-with-angular-and-net-core-web-api-51aab1153778

router.post(
    '/login',
    asyncHandler(async (req, res) => {
        const { email, username, password } = req.body ?? {};
        if ((!email && !username) || !password) {
            throw new ValidationError('Missing credentials');
        }

        const identifier = email ?? username;
        const byEmail = Boolean(email);

        // Find user (including inactive to check suspension status)
        const user = await userService.findUserIncludingInactive(
            identifier,
            byEmail
        );
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Check if user is suspended
        if (!user.is_active) {
            throw new ForbiddenError(
                'Your account has been suspended. Please contact support.'
            );
        }

        // Verify password
        const isValidPassword = await userService.verifyPassword(
            password,
            user.password_hash
        );
        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Fetch user roles
        const roles = await userService.getUserRoles(user.user_id);

        // Check if restaurant owner has pending restaurant
        if (roles.includes(UserRole.RESTAURANT_OWNER)) {
            const restaurant = await restaurantService.getRestaurantByOwner(
                user.user_id
            );
            if (restaurant && restaurant.status === RestaurantStatus.NEW) {
                throw new ForbiddenError(
                    'Your registration is pending approval. Please wait for a site-manager to review your application.'
                );
            }
        }

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
    })
);

router.post(
    '/signup',
    asyncHandler(async (req, res) => {
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
            throw new ValidationError(
                'Missing required fields: username, email, password, role'
            );
        }

        // Validate role
        if (!ALL_ROLES.includes(role)) {
            throw new ValidationError(
                `Invalid role. Must be one of: ${ALL_ROLES.join(', ')}`
            );
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
                throw new ValidationError(
                    'Restaurant registration requires name, contact email, contact phone, and address'
                );
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

        // Create user via service (throws ConflictError if email/username exists)
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
    })
);

router.post(
    '/forgot-password',
    asyncHandler(async (req, res) => {
        const { email } = req.body ?? {};
        if (!email) {
            throw new ValidationError('Email is required');
        }

        await userService.requestPasswordReset(email);

        // Always return success to prevent leaking email info
        return res.json({
            status: 'ok',
            data: {
                message: 'If the email exists, a reset link has been sent',
            },
        });
    })
);

router.post(
    '/reset-password',
    asyncHandler(async (req, res) => {
        const { token, newPassword } = req.body ?? {};
        if (!token || !newPassword) {
            throw new ValidationError('Token and new password are required');
        }

        await userService.resetPassword(token, newPassword);

        return res.json({
            status: 'ok',
            data: { message: 'Password has been reset successfully' },
        });
    })
);

export default router;
