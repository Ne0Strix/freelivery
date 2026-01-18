import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../model/api.model';
import { ActiveRestaurant, Category, Dish } from '../model/restaurant.model';

@Injectable({
    providedIn: 'root',
})
export class RestaurantService {
    private http = inject(HttpClient);
    private baseUrl = '/api';

    async getActiveRestaurants(): Promise<ActiveRestaurant[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<ActiveRestaurant[]>>(
                `${this.baseUrl}/restaurants/active`
            )
        );
        return response.data;
    }

    async getCategories(restaurantId: number): Promise<Category[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<Category[]>>(
                `${this.baseUrl}/restaurants/${restaurantId}/categories`
            )
        );
        return response.data;
    }

    async getDishes(restaurantId: number): Promise<Dish[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<Dish[]>>(
                `${this.baseUrl}/restaurants/${restaurantId}/dishes`
            )
        );
        return response.data;
    }
}
