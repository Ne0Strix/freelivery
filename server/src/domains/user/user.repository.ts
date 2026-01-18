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

export interface UserDataRow {
    user_id: number;
    first_name: string | null;
    last_name: string | null;
    salutation: string | null;
    phone_number: string | null;
    date_of_birth: Date | null;
}

export interface UserWithRoles {
    user_id: number;
    username: string;
    email: string;
    is_active: boolean;
    created_at: Date;
    roles: string[];
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

    /** Update user_data with phone number */
    async updateUserDataPhone(
        userId: number,
        phoneNumber: string
    ): Promise<void> {
        await this.query(
            'UPDATE user_data SET phone_number = $1 WHERE user_id = $2',
            [phoneNumber, userId]
        );
    }

    /** Link user to address */
    async linkUserAddress(
        userId: number,
        addressId: number,
        isDefault: boolean = true
    ): Promise<void> {
        await this.query(
            'INSERT INTO user_address (user_id, address_id, is_default) VALUES ($1, $2, $3)',
            [userId, addressId, isDefault]
        );
    }

    /** Find user by email or username, including inactive users; used to check suspension status */
    async findByEmailOrUsernameIncludingInactive(
        identifier: string,
        byEmail: boolean
    ): Promise<UserRow | null> {
        const whereClause = byEmail ? 'email = $1' : 'username = $1';
        const result = await this.query(
            `SELECT * FROM "user" WHERE ${whereClause} LIMIT 1`,
            [identifier]
        );
        return (result.rows[0] as UserRow) ?? null;
    }

    /** Get all users with their roles for admin listing */
    async findAllWithRoles(): Promise<UserWithRoles[]> {
        const result = await this.query(`
            SELECT u.user_id, u.username, u.email, u.is_active, u.created_at,
                   COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles
            FROM "user" u
            LEFT JOIN user_role ur ON u.user_id = ur.user_id
            LEFT JOIN role r ON ur.role_id = r.role_id
            GROUP BY u.user_id
            ORDER BY u.created_at DESC
        `);
        return result.rows as UserWithRoles[];
    }

    /** Update user's active status */
    async setActiveStatus(userId: number, isActive: boolean): Promise<void> {
        await this.query(
            `UPDATE "user" SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
            [isActive, userId]
        );
    }

    /** Get user_data for a user */
    async getUserData(userId: number): Promise<UserDataRow | null> {
        const result = await this.query<UserDataRow>(
            'SELECT * FROM user_data WHERE user_id = $1',
            [userId]
        );
        return result.rows[0] ?? null;
    }

    /** Update user_data fields */
    async updateUserData(
        userId: number,
        data: Partial<Omit<UserDataRow, 'user_id'>>
    ): Promise<void> {
        await this.query(
            `UPDATE user_data 
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 salutation = COALESCE($3, salutation),
                 phone_number = COALESCE($4, phone_number),
                 date_of_birth = COALESCE($5, date_of_birth)
             WHERE user_id = $6`,
            [
                data.first_name,
                data.last_name,
                data.salutation,
                data.phone_number,
                data.date_of_birth,
                userId,
            ]
        );
    }

    /** Update user email */
    async updateEmail(userId: number, email: string): Promise<void> {
        await this.query(
            `UPDATE "user" SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
            [email, userId]
        );
    }

    /** Update user password hash */
    async updatePasswordHash(
        userId: number,
        passwordHash: string
    ): Promise<void> {
        await this.query(
            `UPDATE "user" SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
            [passwordHash, userId]
        );
    }

    /** Check if email is taken by another user */
    async isEmailTakenByOther(
        email: string,
        excludeUserId: number
    ): Promise<boolean> {
        const result = await this.query(
            'SELECT user_id FROM "user" WHERE email = $1 AND user_id != $2 LIMIT 1',
            [email, excludeUserId]
        );
        return result.rows.length > 0;
    }

    /** Check if user owns an address */
    async userOwnsAddress(userId: number, addressId: number): Promise<boolean> {
        const result = await this.query(
            'SELECT 1 FROM user_address WHERE user_id = $1 AND address_id = $2 LIMIT 1',
            [userId, addressId]
        );
        return result.rows.length > 0;
    }

    /** Unlink address from user */
    async unlinkUserAddress(userId: number, addressId: number): Promise<void> {
        await this.query(
            'DELETE FROM user_address WHERE user_id = $1 AND address_id = $2',
            [userId, addressId]
        );
    }
}
