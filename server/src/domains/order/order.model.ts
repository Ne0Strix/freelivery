export interface Order {
    orderId: number;
    userId: number;
    restaurantId: number;
    orderItems: OrderItem[];
    deliveryAddressId: number;
    status: OrderStatus;
    subtotalAmount: number;
    serviceFeeAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    estimatedDeliveryTime: Date;
    deliveredAt: Date | null;
    createdAt: Date;
}

export interface OrderItem {
    orderItemId: number;
    orderId: number;
    dishId: number;
    dishName: string;
    unitPrice: number;
    quantity: number;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    CREDIT_CARD = 'CREDIT_CARD',
    PAYPAL = 'PAYPAL',
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}
