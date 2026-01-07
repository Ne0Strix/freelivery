export interface Cart {
    cartId: number;
    userId: number;
    restaurantId: number;
    cartItems: CartItem[];
}

export interface CartItem {
    cartItemId: number;
    cartId: number;
    dishId: number;
    quantity: number;
}
