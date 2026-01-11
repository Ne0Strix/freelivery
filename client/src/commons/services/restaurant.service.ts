import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../model/api.model';
import { ActiveRestaurant } from '../model/restaurant.model';

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
}
