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
    private baseUrl = '/api';

    async getRestaurants(): Promise<Restaurant[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<Restaurant[]>>(
                `${this.baseUrl}/restaurants/active`
            )
        );
        return response.data;
    }

    async getRestaurantMenu(restaurantId: number): Promise<MenuItem[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<MenuItem[]>>(
                `${this.baseUrl}/customer/restaurants/${restaurantId}/menu`
            )
        );
        return response.data;
    }

    getCustomerCart(): CartItem[] {
        const savedItems = localStorage.getItem('user_cart_items');
        const savedItems ? JSON.parse(savedItems) : [];
    }

    saveCartToLocal(items: CartItem[]): void {
        localStorage.setItem('user_cart_itmes', JSON.stringify(items));
    }

    addDishToCart(dishItem: MenuItem, howMany: number = 1): void {
        const currentCart = this.getCustomerCart();

        const foundIndex = currentCart.findIndex(item=> item.dishId === dishItem.dishId);

        if(foundIndex !== -1) {
            currentCart[foundIndex].quanitty += howMany;
        } else {
            const newCartItem: CartItem = {
                dishId: dishItem.dishId,
                name: dishItem.name,
                price: dishItem.price,
                quantity: howMany
            };
            currentCart.push(newCartItem);
        }

        this.saveCartToLocal(currentCart);
    }

    removeFromCart(dishIdToRemove: number): void{
        let currentCart = this.getCustomerCart();
        currentCart = currentCart.filter(item => item.dishId !== dishIdToRemove);
        this.saveCartToLocal(currentCart);
    }

    calculateTotal(): number {
        const cartItems = this.getCustomerCart();
        let totalPrice = 0;
        cartItems.forEach(item => {
            totalPrice += item.price * item.quantity;
        });
        return totalPrice;

    }

    async sendOrderToServer(restaurantId: number, items: CartItem[], discountCode?: string) {
        try{
            const orderPayload = {
                restaurant_id: restaurantId,
                order_items: items.map(item =>({
                    dish_id: item.dishId,
                    dish_name: item.name,
                    amount: item.quantity,
                    price_each: item.price
                })),
                discound_code: discountCode || null,
                order_time: new Date().toISOString()
            };

            const response = await firstValueFrom(
                this.http.post<ApiResponse<{order_number: number}>>(
                    `${this.baseUrl}/customer/place_order`,
                    orderPayload
                )
            );
            if(response.success) {
                localStorage.removeItem('user_cart_items');
            }
            return response.data;
        } catch(error) {
            console.error('Error placing order:', error);
            throw error;
        }
    }

    async currentOrderStatus(orderNumber: number) {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<any>>(
                `${this.baseUrl}/customer/order_status/${orderNumber}`
            )
             
        );
        return response.data;
    }
}
