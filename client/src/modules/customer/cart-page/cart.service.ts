import { Injectable } from '@angular/core';

export interface CartItem {
    dishId: number;
    name: string;
    price: number;
    quantity: number;
    restaurantId?: number;
    restaurantName?: string;
    description?: string;
    imageUrl?: string;
}

export interface CartData {
    items: CartItem[];
    restaurantId?: number;
    restaurantName?: string;
}

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private readonly STORAGE_KEY = 'user_cart_items';
    private readonly RESTAURANT_KEY = 'cart_restaurant_info';

    getCustomerCart(): CartItem[] {
        const cartData = this.getCartData();
        return cartData.items;
    }

    getCartData(): CartData {
        const savedItems = localStorage.getItem(this.STORAGE_KEY);
        const savedRestaurant = localStorage.getItem(this.RESTAURANT_KEY);

        const items = savedItems ? JSON.parse(savedItems) : [];
        const restaurantInfo = savedRestaurant
            ? JSON.parse(savedRestaurant)
            : {};

        return {
            items,
            restaurantId: restaurantInfo.restaurantId,
            restaurantName: restaurantInfo.restaurantName,
        };
    }

    saveCartToLocal(
        items: CartItem[],
        restaurantId?: number,
        restaurantName?: string
    ): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));

        if (restaurantId && restaurantName) {
            localStorage.setItem(
                this.RESTAURANT_KEY,
                JSON.stringify({
                    restaurantId,
                    restaurantName,
                })
            );
        }
    }

    addToCart(
        item: CartItem,
        restaurantId?: number,
        restaurantName?: string
    ): void {
        const cartData = this.getCartData();
        const currentCart = cartData.items;

        if (
            currentCart.length > 0 &&
            cartData.restaurantId &&
            restaurantId &&
            cartData.restaurantId !== restaurantId
        ) {
            const confirmClear = confirm(
                `The cart is not empty and contains item from ${cartData.restaurantName}. Do you want to clear the cart?`
            );

            if (confirmClear) {
                this.clearCart();
                currentCart.length = 0;
            } else {
                return;
            }
        }
        const index = currentCart.findIndex(
            (cartItem) => cartItem.dishId === item.dishId
        );
        if (index !== -1) {
            currentCart[index].quantity += item.quantity;
        } else {
            currentCart.push({
                ...item,
                restaurantId: restaurantId || item.restaurantId,
                restaurantName: restaurantName || item.restaurantName,
            });
        }

        this.saveCartToLocal(
            currentCart,
            restaurantId || cartData.restaurantId,
            restaurantName || cartData.restaurantName
        );
    }
    removeFromCart(removeDish: number): void {
        const cartData = this.getCartData();
        let currentCart = cartData.items;
        currentCart = currentCart.filter((item) => item.dishId !== removeDish);

        if (currentCart.length === 0) {
            this.clearCart();
        } else {
            this.saveCartToLocal(
                currentCart,
                cartData.restaurantId,
                cartData.restaurantName
            );
        }
    }

    changeQuantity(dishId: number, newQ: number): void {
        if (newQ < 1) {
            this.removeFromCart(dishId);
            return;
        }

        const cartData = this.getCartData();
        const currentCart = this.getCustomerCart();
        const index = currentCart.findIndex((item) => item.dishId === dishId);

        if (index !== -1) {
            currentCart[index].quantity = newQ;
            this.saveCartToLocal(
                currentCart,
                cartData.restaurantId,
                cartData.restaurantName
            );
        }
    }

    clearCart(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.RESTAURANT_KEY);
    }

    getTotal(): number {
        const items = this.getCustomerCart();
        return items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    }

    getCartCount(): number {
        const items = this.getCustomerCart();
        return items.reduce((total, item) => total + item.quantity, 0);
    }

    async submitOrderToServer(
        restaurantId: number,
        items: CartItem[],
        discountCode?: string,
        paymentMethod?: string
    ): Promise<{ order_number: number }> {
        console.log('Order:', {
            restaurantId,
            items,
            discountCode,
            paymentMethod,
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                const orderNumber = Math.floor(Math.random() * 10000) + 1000;

                const orderData = {
                    orderNumber,
                    restaurantId,
                    items,
                    discountCode,
                    paymentMethod,
                    orderDate: new Date().toISOString(),
                    status: 'placed',
                };
                localStorage.setItem(
                    `order_${orderNumber}`,
                    JSON.stringify(orderData)
                );

                resolve({ order_number: orderNumber });
            }, 1000);
        });
    }
}
