import { Injectable } from '@angular/core';

export interface CartItem {
    dishId: number;
    name: string;
    price: number;
    quantity: number;
}

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private readonly STORAGE_KEY = 'user_cart_items';

    getCustomerCart(): CartItem[] {
        const savedItems = localStorage.getItem(this.STORAGE_KEY);
        return savedItems ? JSON.parse(savedItems) : [];
    }

    saveCartToLocal(items: CartItem[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    }

    addToCart(item: CartItem): void {
        const currentCart = this.getCustomerCart();
        const index = currentCart.findIndex(
            (cartItem) => cartItem.dishId === item.dishId
        );
        if (index !== -1) {
            currentCart[index].quantity += item.quantity;
        } else {
            currentCart.push(item);
        }

        this.saveCartToLocal(currentCart);
    }
    removeFromCart(removeDish: number): void {
        let currentCart = this.getCustomerCart();
        currentCart = currentCart.filter((item) => item.dishId !== removeDish);
        this.saveCartToLocal(currentCart);
    }

    changeQuantity(dishId: number, newQ: number): void {
        if (newQ < 1) {
            this.removeFromCart(dishId);
        }

        const currentCart = this.getCustomerCart();
        const index = currentCart.findIndex((item) => item.dishId === dishId);

        if (index !== -1) {
            currentCart[index].quantity = newQ;
            this.saveCartToLocal(currentCart);
        }
    }

    clearCart(): void {
        localStorage.removeItem(this.STORAGE_KEY);
    }

    getTotal(): number {
        const items = this.getCustomerCart();
        return items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    }

    async submitOrderToServer(
        restaurantId: number,
        items: CartItem[],
        discountCode?: string
    ): Promise<{ order_number: number }> {
        console.log('Order:', { restaurantId, items, discountCode });
        return Promise.resolve({
            order_number: Math.floor(Math.random() * 1000),
        });
    }
}
