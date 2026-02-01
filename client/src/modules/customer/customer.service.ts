import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../commons/model/api.model';
import { MenuItem, Restaurant } from './customer.model';

@Injectable({
    providedIn: 'root',
})
export class CustomerService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:3000/api';

    async getRestaurants(): Promise<Restaurant[]> {
        try {
            const response = await firstValueFrom(
                this.http.get<ApiResponse<Restaurant[]>>(
                    `${this.baseUrl}/restaurants/active`
                )
            );
            return (response.data || []).map((r) => this.processRestaurants(r));
        } catch (error) {
            console.error('Error finding restaurants:', error);
            return [];
        }
    }

    async getRestaurantById(restaurantId: number): Promise<Restaurant> {
        try {
            const response = await firstValueFrom(
                this.http.get<ApiResponse<Restaurant>>(
                    `${this.baseUrl}/restaurants/${restaurantId}`
                )
            );
            return response.data;
        } catch (error) {
            console.error(`Error finding restaurants ${restaurantId}:`, error);
            throw error;
        }
    }

    async getRestaurantMenu(restaurantId: number): Promise<MenuItem[]> {
        try {
            const response = await firstValueFrom(
                this.http.get<ApiResponse<any[]>>(
                    `${this.baseUrl}/restaurants/${restaurantId}/menu`
                )
            );
            return (response.data || []).map((item) => ({
                dishId: item.dishId,
                name: item.name,
                description: item.description || '',
                price:
                    typeof item.price === 'number'
                        ? item.price
                        : parseFloat(item.price || '0'),
                category: item.categoryName || 'Uncategorized',
                imageUrl: item.imageUrl || item.image_url || null,
                photo: item.imageUrl || item.image_url || null,
                isAvailable: item.isAvailable !== false,
                restaurantId: restaurantId,
            }));
        } catch (error) {
            console.error(
                `Error fetching menu for restaurant ${restaurantId}:`,
                error
            );

            return [];
        }
    }

    async getRestaurantCategories(restaurantId: number): Promise<string[]> {
        try {
            const menuItems = await this.getRestaurantMenu(restaurantId);
            const categoriesU = [
                ...new Set(menuItems.map((item) => item.category)),
            ];
            return categoriesU.filter((cat) => cat && cat.trim() !== '');
        } catch (error) {
            console.error(
                `Error fetching categories for restaurant ${restaurantId}:`,
                error
            );
            return ['All'];
        }
    }

    async addToCart(item: any): Promise<void> {
        try {
            const response = await firstValueFrom(
                this.http.post<ApiResponse<any>>(
                    `${this.baseUrl}/customer/cart`,
                    {
                        dishId: item.dishId,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                        restaurantId: item.restaurantId,
                    }
                )
            );
            console.log('Item added to cart Api:', response);
        } catch (error) {
            console.error('Error adding item to cart:', error);
            this.addToCartLocalStorage(item);
        }
    }

    private addToCartLocalStorage(item: any): void {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        const itemIndex = cart.findIndex(
            (cartItem: any) =>
                cartItem.dishId === item.dishId &&
                cartItem.restaurantId === item.restaurantId
        );

        if (itemIndex >= 0) {
            cart[itemIndex].quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
    }

    async getCart(): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.http.get<ApiResponse<any[]>>(
                    `${this.baseUrl}/customer/cart`
                )
            );
            console.log('Cart from API:', response.data);
            return response.data || [];
        } catch (error: any) {
            console.error('Error fetching cart:', error);

            if (error.status === 404) {
                console.log('Cart API not found. Currently using localStorage');
                return this.getCartFromLocalStorage();
            }
            return [];
        }
    }

    async updateCartItem(itemId: number, quantity: number): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.http.put<ApiResponse<any>>(
                    `${this.baseUrl}/customer/cart/${itemId}`,
                    { quantity }
                )
            );
            return response.data;
        } catch (error: any) {
            console.error('Error updating cart item ${itemId}:', error);

            if (error.status === 404) {
                return this.updateCartItemLocalStorage(itemId, quantity);
            }
            throw error;
        }
    }

    async removeFromCart(itemId: number): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.http.delete<ApiResponse<any>>(
                    `${this.baseUrl}/customer/cart/${itemId}`
                )
            );
            return response.data;
        } catch (error: any) {
            console.error('Error removing cart item ${itemId}:', error);

            if (error.status === 404) {
                return this.removeFromCartLocalStorage(itemId);
            }
            throw error;
        }
    }

    async clearCart(): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.http.delete<ApiResponse<any>>(
                    `${this.baseUrl}/customer/cart`
                )
            );
            return response.data;
        } catch (error: any) {
            console.error('Error clearing cart:', error);

            if (error.status === 404) {
                localStorage.removeItem('cart');
                return { success: true };
            }
            throw error;
        }
    }

    async placeOrder(
        restaurantId: number,
        items: any[],
        deliveryAddress?: any,
        discountCode?: string
    ): Promise<{ orderNumber: number }> {
        try {
            const orderPayload = {
                restaurant_id: restaurantId,
                order_items: items.map((item) => ({
                    dish_id: item.dishId,
                    dish_name: item.name,
                    amount: item.quantity,
                    price_each: item.price,
                })),
                delivery_address: deliveryAddress,
                discount_code: discountCode || null,
                order_time: new Date().toISOString(),
            };

            const response = await firstValueFrom(
                this.http.post<ApiResponse<{ order_number: number }>>(
                    `${this.baseUrl}/customer/place_order`,
                    orderPayload
                )
            );
            return { orderNumber: response.data.order_number };
        } catch (error) {
            console.error('Error placing order:', error);
            throw error;
        }
    }

    async getOrderStatus(orderNumber: number): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.http.get<ApiResponse<any>>(
                    `${this.baseUrl}/customer/order_status/${orderNumber}`
                )
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching order status ${orderNumber}:', error);
            throw error;
        }
    }

    async getUserOrders(): Promise<any[]> {
        try {
            const response = await firstValueFrom(
                this.http.get<ApiResponse<any[]>>(
                    `${this.baseUrl}/customer/orders`
                )
            );
            return response.data || [];
        } catch (error) {
            console.error('Error fetching user order:', error);
            return [];
        }
    }

    private processRestaurants(restaurant: Restaurant): Restaurant {
        return {
            ...restaurant,

            rating:
                typeof restaurant.rating === 'string'
                    ? parseFloat(restaurant.rating)
                    : restaurant.rating || 4.0,

            deliveryTime: restaurant.deliveryTime || '45-50 min',

            isOpen: this.isRestaurantOpen(restaurant),

            address: this.formatAddress(restaurant),
        };
    }

    private isRestaurantOpen(restaurant: Restaurant): boolean {
        if (restaurant.status) {
            const status = restaurant.status.toUpperCase();
            if (status === 'CLOSED' || status === 'SUSPENDED') {
                console.log('Restaurant:', restaurant.name + ' is closed');
                return false;
            }
            if (status === 'OPEN' || status === 'ACTIVE') {
                return true;
            }
        }
        console.log('Default as open', restaurant.name);
        return true;
    }

    private formatAddress(restaurant: Restaurant): string {
        if (!restaurant.address) return 'Adresss is not available';

        if (typeof restaurant.address === 'string') {
            return restaurant.address;
        }

        if (typeof restaurant.address === 'object') {
            const adr = restaurant.address as any;
            return `${adr.street || ''} ${adr.houseNumber || ''}, ${adr.zipCode || ''} ${adr.city || ''}`.trim();
        }

        return String(restaurant.address);
    }

    async getCartCount(): Promise<number> {
        try {
            const response = await firstValueFrom(
                this.http.get<ApiResponse<{ count: number }>>(
                    `${this.baseUrl}/customer/cart/count`
                )
            );
            console.log('Item count from cart API:', response.data?.count);
            return response.data?.count || 0;
        } catch (error) {
            console.error('Error getting cart item count:', error);

            const cart = await this.getCart();
            return cart.reduce(
                (total: number, item: any) => total + (item.quantity || 1),
                0
            );
        }
    }

    private getCartFromLocalStorage(): any[] {
        try {
            const cartS = localStorage.getItem('cart');
            return cartS ? JSON.parse(cartS) : [];
        } catch (error) {
            console.error(
                'Error fetching cart items from localStorage:',
                error
            );
            return [];
        }
    }

    private updateCartItemLocalStorage(itemId: number, quantity: number): any {
        const cart = this.getCartFromLocalStorage();
        const itemIndex = cart.findIndex(
            (item) => item.cartItemId === itemId || item.dishId === itemId
        );

        if (itemIndex === -1) {
            throw new Error('Item not found');
        }

        if (quantity === 0) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity = quantity;
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        return { success: true };
    }

    private removeFromCartLocalStorage(itemId: number): any {
        const cart = this.getCartFromLocalStorage();
        const filterCart = cart.filter(
            (item) => !(item.cartItemId === itemId || item.dishId === itemId)
        );

        localStorage.setItem('cart', JSON.stringify(filterCart));
        return { success: true };
    }
}
