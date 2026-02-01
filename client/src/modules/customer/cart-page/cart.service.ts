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

@Injectable({
    providedIn: 'root',
})
export class CartService {
    private readonly STORAGE_KEY = 'user_cart_items';
    private readonly RESTAURANT_KEY = 'cart_restaurant_info';

    getCart(): CartItem[] {
        try {
            const cartJson = localStorage.getItem(this.STORAGE_KEY);
            if (!cartJson) return [];
            return JSON.parse(cartJson) as CartItem[];
        } catch (error) {
            console.error('Error reading cart:', error);
            return [];
        }
    }

    getCurrentRestaurant(): { id: number; name: string } | null {
        try {
            const restaurantJson = localStorage.getItem(this.RESTAURANT_KEY);
            if (!restaurantJson) return null;
            return JSON.parse(restaurantJson);
        } catch (error) {
            console.error('Error reading restaurant:', error);
            return null;
        }
    }

    addToCart(
        item: Omit<CartItem, 'quantity'> & { quantity?: number },
        restaurantId?: number,
        restaurantName?: string
    ): void {
        const currentRestaurant = this.getCurrentRestaurant();

        if (currentRestaurant && currentRestaurant.id !== restaurantId) {
            const confirmClear = confirm(
                `The cart is not empty and contains items from ${currentRestaurant.name}. Do you want to clear the cart?`
            );

            if (confirmClear) {
                return;
            }

            this.clearCart();
        }

        localStorage.setItem(
            this.RESTAURANT_KEY,
            JSON.stringify({ id: restaurantId, name: restaurantName })
        );

        const cart = this.getCart();
        const itemExists = cart.findIndex(
            (cartItem) => cartItem.dishId === item.dishId
        );

        if (itemExists >= 0) {
            cart[itemExists].quantity += item.quantity || 1;
        } else {
            cart.push({
                ...item,
                quantity: item.quantity || 1,
                restaurantId,
                restaurantName,
            } as CartItem);
        }

        this.saveCart(cart);
    }

    removeFromCart(dishId: number): void {
        const cart = this.getCart().filter((item) => item.dishId !== dishId);
        this.saveCart(cart);

        if (cart.length === 0) {
            localStorage.removeItem(this.RESTAURANT_KEY);
        }
    }

    changeQuantity(dishId: number, newQ: number): void {
        if (newQ < 1) {
            this.removeFromCart(dishId);
            return;
        }

        const cartData = this.getCart();
        const index = cartData.findIndex((item) => item.dishId === dishId);

        if (index >= 0) {
            if (newQ === 0) {
                cartData.splice(index, 1);
            } else {
                cartData[index].quantity = newQ;
            }
            this.saveCart(cartData);
        }
    }

    clearCart(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.RESTAURANT_KEY);
    }

    getTotal(deliveryFee: number = 0): number {
        return this.getSubtotal() + deliveryFee;
    }

    getSubtotal(): number {
        const cart = this.getCart();
        return cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    }

    getCartCount(): number {
        const items = this.getCart();
        return items.reduce((total, item) => total + item.quantity, 0);
    }

    private saveCart(cart: CartItem[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart', error);
        }
    }

    cartNotEmpty(restaurantId: number): boolean {
        const currentRestaurant = this.getCurrentRestaurant();
        return currentRestaurant?.id === restaurantId;
    }

    isCartValid(): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];
        const cart = this.getCart();

        if (cart.length === 0) {
            errors.push('Cart is empty');
        }

        const restaurant = this.getCurrentRestaurant();
        if (!restaurant) {
            errors.push('No restaurant selected');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
