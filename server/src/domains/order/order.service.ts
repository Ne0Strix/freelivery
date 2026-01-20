import { ForbiddenError, ValidationError } from '../commons/errors.js';
import { RestaurantRepository } from '../restaurant/restaurant.repository.js';
import { OrderStatus } from './order.model.js';
import {
    OrderRepository,
    type OrderItemRow,
    type RestaurantOrderRow,
} from './order.repository.js';

// =====================
// DTOs for API
// =====================

export interface RestaurantOrderItem {
    orderItemId: number;
    dishId: number;
    dishName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface RestaurantOrder {
    orderId: number;
    status: OrderStatus;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    deliveryAddress: string;
    items: RestaurantOrderItem[];
    subtotalAmount: number;
    serviceFeeAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: string;
    estimatedDeliveryTime: Date | null;
    createdAt: Date;
}

// =====================
// Status Transitions
// =====================

/** Valid status transitions for restaurant owners */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING],
    [OrderStatus.PREPARING]: [OrderStatus.OUT_FOR_DELIVERY],
    [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
};

function isValidTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
): boolean {
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    return allowed.includes(newStatus);
}

// =====================
// Service
// =====================

export class OrderService {
    constructor(
        private orderRepository: OrderRepository,
        private restaurantRepository: RestaurantRepository
    ) {}

    /**
     * Get all orders for the restaurant owned by the given user
     */
    async getOrdersForOwner(ownerUserId: number): Promise<RestaurantOrder[]> {
        // Find the owner's restaurant
        const restaurant =
            await this.restaurantRepository.findByOwnerId(ownerUserId);

        if (!restaurant) {
            throw new ForbiddenError('You do not own a restaurant');
        }

        // Get orders with customer info
        const orderRows = await this.orderRepository.getOrdersForRestaurant(
            restaurant.restaurant_id
        );

        if (orderRows.length === 0) {
            return [];
        }

        // Get order items for all orders
        const orderIds = orderRows.map((o) => o.order_id);
        const itemRows = await this.orderRepository.getOrderItems(orderIds);

        // Group items by order
        const itemsByOrder = new Map<number, OrderItemRow[]>();
        for (const item of itemRows) {
            const items = itemsByOrder.get(item.order_id) || [];
            items.push(item);
            itemsByOrder.set(item.order_id, items);
        }

        // Transform to DTOs
        return orderRows.map((row) => this.toOrderDTO(row, itemsByOrder));
    }

    /**
     * Update order status with validation
     */
    async updateOrderStatus(
        ownerUserId: number,
        orderId: number,
        newStatus: OrderStatus
    ): Promise<RestaurantOrder> {
        // Find the owner's restaurant
        const restaurant =
            await this.restaurantRepository.findByOwnerId(ownerUserId);

        if (!restaurant) {
            throw new ForbiddenError('You do not own a restaurant');
        }

        // Get the order
        const order = await this.orderRepository.getByIdOrThrow(orderId, {
            message: 'Order not found',
        });

        // Verify order belongs to owner's restaurant
        if (order.restaurant_id !== restaurant.restaurant_id) {
            throw new ForbiddenError(
                'This order does not belong to your restaurant'
            );
        }

        // Validate status transition
        if (!isValidTransition(order.status, newStatus)) {
            throw new ValidationError(
                `Cannot transition from ${order.status} to ${newStatus}`
            );
        }

        // Update status
        await this.orderRepository.updateStatus(orderId, newStatus);

        // Return updated order with full details
        const orders = await this.getOrdersForOwner(ownerUserId);
        const updatedOrder = orders.find((o) => o.orderId === orderId);

        if (!updatedOrder) {
            throw new Error('Failed to retrieve updated order');
        }

        return updatedOrder;
    }

    // =====================
    // Private Helpers
    // =====================

    private toOrderDTO(
        row: RestaurantOrderRow,
        itemsByOrder: Map<number, OrderItemRow[]>
    ): RestaurantOrder {
        const items = itemsByOrder.get(row.order_id) || [];

        return {
            orderId: row.order_id,
            status: row.status,
            customerName: row.customer_username,
            customerEmail: row.customer_email,
            customerPhone: row.customer_phone,
            deliveryAddress: this.formatAddress(row),
            items: items.map((item) => ({
                orderItemId: item.order_item_id,
                dishId: item.dish_id,
                dishName: item.dish_name_snapshot,
                unitPrice: Number(item.unit_price),
                quantity: item.quantity,
                lineTotal: Number(item.unit_price) * item.quantity,
            })),
            subtotalAmount: Number(row.subtotal_amount),
            serviceFeeAmount: Number(row.service_fee_amount),
            discountAmount: Number(row.discount_amount),
            totalAmount: Number(row.total_amount),
            paymentMethod: row.payment_method,
            estimatedDeliveryTime: row.estimated_delivery_time,
            createdAt: row.created_at,
        };
    }

    private formatAddress(row: RestaurantOrderRow): string {
        const parts = [
            `${row.delivery_street} ${row.delivery_house_number}`,
            `${row.delivery_zip} ${row.delivery_city}`,
        ];
        if (row.delivery_additional_info) {
            parts.push(`(${row.delivery_additional_info})`);
        }
        return parts.join(', ');
    }
}
