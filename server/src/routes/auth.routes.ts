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

        // Find user
        const user = await userService.findUserForLogin(identifier, byEmail);
        if (!user) {
            return res
                .status(401)
                .json({ status: 'error', error: 'Invalid credentials' });
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
        const { username, email, password, role } = req.body ?? {};

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

        // Create user via service
        const { userId } = await userService.createUser(
            username,
            email,
            password,
            role
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
