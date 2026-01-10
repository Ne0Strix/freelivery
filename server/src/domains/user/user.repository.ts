import { Repository } from '../commons/abstract-repository.js';

export interface UserRow {
    user_id: number;
    username: string;
    email: string;
    password_hash: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export class UserRepository extends Repository<UserRow> {
    constructor() {
        super('"user"', 'user_id');
    }

    async existsByEmailOrUsername(
        email: string,
        username: string
    ): Promise<boolean> {
        const result = await this.query(
            'SELECT user_id FROM "user" WHERE email = $1 OR username = $2 LIMIT 1',
            [email, username]
        );
        return result.rows.length > 0;
    }

    async findByEmailOrUsername(
        identifier: string,
        byEmail: boolean
    ): Promise<UserRow | null> {
        const whereClause = byEmail ? 'email = $1' : 'username = $1';
        const result = await this.query(
            `SELECT * FROM "user" WHERE ${whereClause} AND is_active = true LIMIT 1`,
            [identifier]
        );
        return (result.rows[0] as UserRow) ?? null;
    }

    create(item: UserRow): Promise<UserRow> {
        return this.createUser(item.username, item.email, item.password_hash);
    }

    async createUser(
        username: string,
        email: string,
        passwordHash: string
    ): Promise<UserRow> {
        const result = await this.query(
            `INSERT INTO "user" (username, email, password_hash, is_active)
             VALUES ($1, $2, $3, true)
             RETURNING *`,
            [username, email, passwordHash]
        );
        return result.rows[0] as UserRow;
    }

    update(_id: number, _item: Partial<UserRow>): Promise<UserRow> {
        throw new Error('Method not implemented.');
    }

    async getRoleIdByName(roleName: string): Promise<number | null> {
        const result = await this.query(
            'SELECT role_id FROM role WHERE name = $1',
            [roleName]
        );
        return result.rows[0]?.role_id ?? null;
    }

    async assignRole(userId: number, roleId: number): Promise<void> {
        await this.query(
            'INSERT INTO user_role (user_id, role_id) VALUES ($1, $2)',
            [userId, roleId]
        );
    }

    async getUserRoles(userId: number): Promise<string[]> {
        const result = await this.query(
            `SELECT r.name FROM role r
             INNER JOIN user_role ur ON r.role_id = ur.role_id
             WHERE ur.user_id = $1`,
            [userId]
        );
        return result.rows.map((row) => row.name);
    }

    /** Create empty user_data record */
    async createUserData(userId: number): Promise<void> {
        await this.query('INSERT INTO user_data (user_id) VALUES ($1)', [
            userId,
        ]);
    }
}
