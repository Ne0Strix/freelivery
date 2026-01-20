import { Repository } from '../commons/abstract-repository.js';
import { OrderStatus } from './order.model.js';

// =====================
// Row Interfaces
// =====================

export interface OrderRow {
    order_id: number;
    customer_user_id: number;
    restaurant_id: number;
    delivery_address_id: number;
    status: OrderStatus;
    subtotal_amount: string; // DECIMAL comes as string from pg
    service_fee_amount: string;
    discount_amount: string;
    total_amount: string;
    payment_method: string;
    estimated_delivery_time: Date | null;
    delivered_at: Date | null;
    created_at: Date;
    updated_at: Date;
}

export interface OrderItemRow {
    order_item_id: number;
    order_id: number;
    dish_id: number;
    dish_name_snapshot: string;
    unit_price: string; // DECIMAL comes as string from pg
    quantity: number;
    created_at: Date;
}

/** Extended row for restaurant owner order view (with customer info and address) */
export interface RestaurantOrderRow extends OrderRow {
    customer_username: string;
    customer_email: string;
    customer_phone: string | null;
    delivery_street: string;
    delivery_house_number: string;
    delivery_city: string;
    delivery_zip: string;
    delivery_additional_info: string | null;
}

export class OrderRepository extends Repository<OrderRow> {
    constructor() {
        super('"order"', 'order_id');
    }

    /**
     * Get all orders for a restaurant with customer info and delivery address
     */
    async getOrdersForRestaurant(
        restaurantId: number
    ): Promise<RestaurantOrderRow[]> {
        const query = `
            SELECT 
                o.*,
                u.username AS customer_username,
                u.email AS customer_email,
                ud.phone_number AS customer_phone,
                a.street_name AS delivery_street,
                a.house_number AS delivery_house_number,
                a.city_name AS delivery_city,
                a.zip_code AS delivery_zip,
                a.additional_info AS delivery_additional_info
            FROM "order" o
            JOIN "user" u ON o.customer_user_id = u.user_id
            LEFT JOIN user_data ud ON u.user_id = ud.user_id
            JOIN address a ON o.delivery_address_id = a.address_id
            WHERE o.restaurant_id = $1
            ORDER BY 
                CASE o.status 
                    WHEN 'PENDING' THEN 1
                    WHEN 'CONFIRMED' THEN 2
                    WHEN 'PREPARING' THEN 3
                    WHEN 'OUT_FOR_DELIVERY' THEN 4
                    ELSE 5
                END,
                o.created_at DESC
        `;
        const result = await this.query<RestaurantOrderRow>(query, [
            restaurantId,
        ]);
        return result.rows;
    }

    /**
     * Get order items for multiple orders
     */
    async getOrderItems(orderIds: number[]): Promise<OrderItemRow[]> {
        if (orderIds.length === 0) return [];

        const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            SELECT * FROM order_item
            WHERE order_id IN (${placeholders})
            ORDER BY order_item_id
        `;
        const result = await this.query<OrderItemRow>(query, orderIds);
        return result.rows;
    }

    /**
     * Update order status
     */
    async updateStatus(
        orderId: number,
        status: OrderStatus
    ): Promise<OrderRow> {
        const query = `
            UPDATE "order"
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $2
            RETURNING *
        `;
        const result = await this.query<OrderRow>(query, [status, orderId]);
        return result.rows[0];
    }

    // =====================
    // Analytics Queries
    // =====================

    /**
     * Get daily order counts for a restaurant over the last N days
     */
    async getDailyOrderCountsForRestaurant(
        restaurantId: number,
        days: number = 7
    ): Promise<DailyOrderCountRow[]> {
        const query = `
            SELECT 
                DATE(created_at) AS order_date,
                COUNT(*) AS order_count,
                COALESCE(SUM(total_amount), 0) AS daily_revenue
            FROM "order"
            WHERE restaurant_id = $1
              AND created_at >= CURRENT_DATE - INTERVAL '${days - 1} days'
            GROUP BY DATE(created_at)
            ORDER BY order_date DESC
        `;
        const result = await this.query<DailyOrderCountRow>(query, [
            restaurantId,
        ]);
        return result.rows;
    }

    /**
     * Get top dishes by quantity ordered for a restaurant
     */
    async getTopDishesForRestaurant(
        restaurantId: number,
        limit: number = 5
    ): Promise<TopDishRow[]> {
        const query = `
            SELECT 
                oi.dish_id,
                oi.dish_name_snapshot AS dish_name,
                SUM(oi.quantity) AS total_quantity,
                COUNT(DISTINCT oi.order_id) AS order_count
            FROM order_item oi
            JOIN "order" o ON oi.order_id = o.order_id
            WHERE o.restaurant_id = $1
            GROUP BY oi.dish_id, oi.dish_name_snapshot
            ORDER BY total_quantity DESC
            LIMIT $2
        `;
        const result = await this.query<TopDishRow>(query, [
            restaurantId,
            limit,
        ]);
        return result.rows;
    }

    // Required abstract methods
    async create(_item: OrderRow): Promise<OrderRow> {
        throw new Error('Use dedicated order creation method');
    }

    async update(_id: number, _item: Partial<OrderRow>): Promise<OrderRow> {
        throw new Error('Use dedicated update methods');
    }
}

// =====================
// Analytics Row Interfaces
// =====================

export interface DailyOrderCountRow {
    order_date: Date;
    order_count: string; // COUNT returns string from pg
    daily_revenue: string; // SUM returns string from pg
}

export interface TopDishRow {
    dish_id: number;
    dish_name: string;
    total_quantity: string; // SUM returns string from pg
    order_count: string; // COUNT returns string from pg
}
