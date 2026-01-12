import { Repository } from '../commons/abstract-repository.js';
import { RestaurantStatus } from './restaurant.service.js';

export interface RestaurantRow {
    restaurant_id: number;
    name: string;
    status: RestaurantStatus;
    description: string;
    cuisine_type: string;
    contact_email: string;
    contact_phone: string;
    address_id: number;
    owner_user_id: number;
    delivery_zone_id: number;
    service_fee_percent: string;
    min_order_amount: string;
    created_at: Date;
    updated_at: Date;
}

export interface ActiveRestaurantRow extends RestaurantRow {
    street_name: string;
    house_number: string;
    city_name: string;
    zip_code: string;
    order_count: string;
    total_revenue: string;
}

export interface PendingRestaurantRow extends RestaurantRow {
    owner_email: string;
    owner_username: string;
}

export class RestaurantRepository extends Repository<RestaurantRow> {
    constructor() {
        super('restaurant', 'restaurant_id');
    }

    create(_item: RestaurantRow): Promise<RestaurantRow> {
        throw new Error('Method not implemented.');
    }

    update(_id: number, _item: Partial<RestaurantRow>): Promise<RestaurantRow> {
        throw new Error('Method not implemented.');
    }

    async getByStatus(status: RestaurantStatus): Promise<RestaurantRow[]> {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE status = $1
        `;
        const result = await this.query<RestaurantRow>(query, [status]);
        return result.rows;
    }

    async getActiveWithStats(): Promise<ActiveRestaurantRow[]> {
        const query = `
            SELECT 
                r.*,
                a.street_name,
                a.house_number,
                a.city_name,
                a.zip_code,
                COUNT(o.order_id) AS order_count,
                COALESCE(SUM(o.total_amount), 0) AS total_revenue
            FROM restaurant r
            LEFT JOIN address a ON r.address_id = a.address_id
            LEFT JOIN "order" o ON r.restaurant_id = o.restaurant_id
            WHERE r.status = 'ACTIVE'
            GROUP BY r.restaurant_id, a.address_id
            ORDER BY r.name
        `;
        const result = await this.query<ActiveRestaurantRow>(query);
        return result.rows;
    }

    async getPendingWithOwnerDetails(): Promise<PendingRestaurantRow[]> {
        const query = `
            SELECT 
                r.*,
                u.email AS owner_email,
                u.username AS owner_username
            FROM restaurant r
            JOIN "user" u ON r.owner_user_id = u.user_id
            WHERE r.status = 'NEW'
            ORDER BY r.created_at DESC
        `;
        const result = await this.query<PendingRestaurantRow>(query);
        return result.rows;
    }

    async updateStatus(
        restaurantId: number,
        status: RestaurantStatus
    ): Promise<RestaurantRow> {
        const query = `
            UPDATE ${this.tableName}
            SET status = $1, updated_at = NOW()
            WHERE ${this.primaryKey} = $2
            RETURNING *
        `;
        const result = await this.query<RestaurantRow>(query, [
            status,
            restaurantId,
        ]);
        return result.rows[0];
    }
}
