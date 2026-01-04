import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const router = Router();

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST ?? 'db',
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT ?? process.env.DB_PORT ?? 5432),
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, username, password } = req.body ?? {};
        if ((!email && !username) || !password) {
            return res
                .status(400)
                .json({ status: 'error', error: 'Missing credentials' });
        }

        const whereClause = email ? 'email = $1' : 'username = $1';
        const identifier = email ?? username;

        const result = await pool.query(
            `SELECT user_id, username, email FROM "user" WHERE ${whereClause} AND password_hash = $2 AND is_active = true LIMIT 1`,
            [identifier, password]
        );

        const user = result.rows[0];
        if (!user) {
            return res
                .status(401)
                .json({ status: 'error', error: 'Invalid credentials' });
        }

        const secret = process.env.JWT_SECRET || 'dev-secret';
        const token = jwt.sign(
            {
                sub: user.user_id,
                username: user.username,
                email: user.email,
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

export default router;
