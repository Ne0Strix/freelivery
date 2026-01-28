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

    async sendOrderToServer(
        restaurantId: number,
        items: any[],
        discountCode?: string
    ) {
        try {
            const orderPayload = {
                restaurant_id: restaurantId,
                order_items: items.map((item) => ({
                    dish_id: item.dishId,
                    dish_name: item.name,
                    amount: item.quantity,
                    price_each: item.price,
                })),
                discount_code: discountCode || null,
                order_time: new Date().toISOString(),
            };

            const response = await firstValueFrom(
                this.http.post<ApiResponse<{ order_number: number }>>(
                    `${this.baseUrl}/customer/place_order`,
                    orderPayload
                )
            );

            return response.data;
        } catch (error) {
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
