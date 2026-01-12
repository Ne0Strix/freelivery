import { Pool, type QueryResult, type QueryResultRow } from 'pg';

export interface MenuItemRow {
    dish_id: number;
    category_id: number;
    category_name: string;
    name: string;
    description: string;
    price: string;
    is_available: boolean;
}

export class CustomerRepository {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST ?? 'db',
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD,
            port: Number(
                process.env.POSTGRES_PORT ?? process.env.DB_PORT ?? 5432
            ),
        });
    }

    protected query<T extends QueryResultRow>(
        text: string,
        params?: unknown[]
    ): Promise<QueryResult<T>> {
        return this.pool.query<T>(text, params);
    }

    async getMenuItemsByRestaurant(
        restaurantId: number
    ): Promise<MenuItemRow[]> {
        const query = `
            SELECT 
                d.dish_id,
                d.category_id,
                c.name AS category_name,
                d.name,
                d.description,
                d.price,
                d.is_available
            FROM dish d
            JOIN category c ON d.category_id = c.category_id
            WHERE d.restaurant_id = $1 AND d.is_available = true
            ORDER BY c.name, d.name
        `;
        const result = await this.query<MenuItemRow>(query, [restaurantId]);
        return result.rows;
    }
}
