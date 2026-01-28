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
    service_fee_percent: string;
    min_order_amount: string;
    max_delivery_distance: number;
    created_at: Date;
    updated_at: Date;
}

export interface ActiveRestaurantRow extends RestaurantRow {
    street_name: string;
    house_number: string;
    city_name: string;
    zip_code: string;
    grid_x: number | null;
    grid_y: number | null;
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

    async create(item: Partial<RestaurantRow>): Promise<RestaurantRow> {
        const query = `
            INSERT INTO ${this.tableName}
            (name, status, description, cuisine_type, contact_email, contact_phone,
             address_id, owner_user_id, service_fee_percent, min_order_amount,
             created_at, updated_at)
            VALUES ($1, 'NEW', $2, $3, $4, $5, $6, $7, 0, 0, NOW(), NOW())
            RETURNING *
        `;
        const result = await this.query<RestaurantRow>(query, [
            item.name,
            item.description,
            item.cuisine_type,
            item.contact_email,
            item.contact_phone,
            item.address_id,
            item.owner_user_id,
        ]);
        return result.rows[0];
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
                a.grid_x,
                a.grid_y,
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

    /** Find restaurant by owner user ID */
    async findByOwnerId(ownerUserId: number): Promise<RestaurantRow | null> {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE owner_user_id = $1
            LIMIT 1
        `;
        const result = await this.query<RestaurantRow>(query, [ownerUserId]);
        return result.rows[0] ?? null;
    }

    async findById(restaurantId: number): Promise<any | null> {
        const query = `
            SELECT
            r.restaurant_id as "restaurantId",
            r.name,
            r.status,
            r.description,
            r.cuisine_type as "cuisineType",
            r.contact_email as "contactEmail",
            r.contact_phone as "contactPhone",
            r.service_fee_percent as "serviceFeePercent",
            r.min_order_amount as "minOrderAmount",
            r.max_delivery_distance as "maxDeliveryDistance",
            r.created_at as "createdAt",
            r.updated_at as "updatedAt",
            r.address_id as "addressId",
            a.street_name as "streetName",
            a.house_number as "houseNumber",
            a.city_name as "cityName",
            a.zip_code as "zipCode",
            a.country

            FROM restaurant r
            LEFT JOIN address a ON r.address_id = a.address_id
            WHERE r.restaurant_id =$1
            `;

        const result = await this.query(query, [restaurantId]);

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];

        const address = row.streetName
            ? `${row.streetName} ${row.houseNumber}, ${row.zipCode} ${row.cityName}, ${row.country}`
            : 'Address not available';

        return {
            restaurantId: row.restaurantId,
            name: row.name,
            status: row.status,
            description: row.description,
            cuisineType: row.cuisineType,
            contactEmail: row.contactEmail,
            contactPhone: row.contactPhone,
            serviceFeePercent: parseFloat(row.serviceFeePercent || '0'),
            minOrderAmount: parseFloat(row.minOrderAmount || '0'),
            maxDeliveryDistance: row.maxDeliveryDistance,
            address: address,
            addressId: row.addressId,
            rating: 4.5,
            deliveryTime: '30-45 min',
            isOpen: row.status === 'ACTIVE',
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }

    async findAllActive(): Promise<any[]> {
        const query = `
            SELECT
            r.restaurant_id as "restaurantId",
            r.name,
            r.status,
            r.description,
            r.cuisine_type as "cuisineType",
            r.contact_email as "contactEmail",
            r.contact_phone as "contactPhone",
            r.service_fee_percent as "serviceFeePercent",
            r.min_order_amount as "minOrderAmount",
            r.max_delivery_distance as "maxDeliveryDistance",
            r.created_at as "createdAt",
            r.updated_at as "updatedAt",
            r.address_id as "addressId",
            a.street_name as "streetName",
            a.house_number as "houseNumber",
            a.city_name as "cityName",
            a.zip_code as "zipCode",
            a.country

            FROM restaurant r
            LEFT JOIN address a ON r.address_id = a.address_id
            WHERE r.status='ACTIVE'
            ORDER BY r.name
            `;

        const result = await this.query(query);

        return result.rows.map((row) => {
            const address = row.streetName
                ? `${row.streetName} ${row.houseNumber}, ${row.zipCode} ${row.cityName}, ${row.country}`
                : 'Address not available';

            return {
                restaurantId: row.restaurantId,
                name: row.name,
                status: row.status,
                description: row.description,
                cuisineType: row.cuisineType,
                contactEmail: row.contactEmail,
                contactPhone: row.contactPhone,
                serviceFeePercent: parseFloat(row.serviceFeePercent || '0'),
                minOrderAmount: parseFloat(row.minOrderAmount || '0'),
                maxDeliveryDistance: row.maxDeliveryDistance,
                address: address,
                addressId: row.addressId,
                rating: 4.5,
                deliveryTime: '30-45 min',
                isOpen: true,
            };
        });
    }

    /** Update restaurant contact details */
    async updateDetails(
        restaurantId: number,
        data: {
            name?: string;
            description?: string;
            contactEmail?: string;
            contactPhone?: string;
            maxDeliveryDistance?: number;
            minOrderAmount?: number;
        }
    ): Promise<RestaurantRow> {
        const query = `
            UPDATE ${this.tableName}
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                contact_email = COALESCE($3, contact_email),
                contact_phone = COALESCE($4, contact_phone),
                max_delivery_distance = COALESCE($5, max_delivery_distance),
                min_order_amount = COALESCE($6, min_order_amount),
                updated_at = NOW()
            WHERE ${this.primaryKey} = $7
            RETURNING *
        `;
        const result = await this.query<RestaurantRow>(query, [
            data.name,
            data.description,
            data.contactEmail,
            data.contactPhone,
            data.maxDeliveryDistance,
            data.minOrderAmount,
            restaurantId,
        ]);
        return result.rows[0];
    }

    /** Update restaurant fees (admin only) */
    async updateFees(
        restaurantId: number,
        data: {
            serviceFeePercent?: number;
            minOrderAmount?: number;
        }
    ): Promise<RestaurantRow> {
        const query = `
            UPDATE ${this.tableName}
            SET service_fee_percent = COALESCE($1, service_fee_percent),
                min_order_amount = COALESCE($2, min_order_amount),
                updated_at = NOW()
            WHERE ${this.primaryKey} = $3
            RETURNING *
        `;
        const result = await this.query<RestaurantRow>(query, [
            data.serviceFeePercent,
            data.minOrderAmount,
            restaurantId,
        ]);
        return result.rows[0];
    }
}
