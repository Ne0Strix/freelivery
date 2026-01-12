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
}
