import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../commons/model/api.model';
import {
    DashboardStatistics,
    PendingRestaurant,
    UserListItem,
} from './site-manager.models';

@Injectable({
    providedIn: 'root',
})
export class SiteManagerService {
    private http = inject(HttpClient);
    private baseUrl = '/api';

    async getStatistics(): Promise<DashboardStatistics> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<DashboardStatistics>>(
                `${this.baseUrl}/site-manager/statistics`
            )
        );
        return response.data;
    }

    async getUsers(): Promise<UserListItem[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<UserListItem[]>>(
                `${this.baseUrl}/site-manager/users`
            )
        );
        return response.data;
    }

    async updateUser(
        userId: number,
        updates: { isActive?: boolean }
    ): Promise<void> {
        await firstValueFrom(
            this.http.patch<ApiResponse<void>>(
                `${this.baseUrl}/site-manager/users/${userId}`,
                updates
            )
        );
    }

    async getPendingRestaurants(): Promise<PendingRestaurant[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<PendingRestaurant[]>>(
                `${this.baseUrl}/site-manager/restaurants/pending`
            )
        );
        return response.data;
    }

    async approveRestaurant(restaurantId: number): Promise<void> {
        await firstValueFrom(
            this.http.post<ApiResponse<void>>(
                `${this.baseUrl}/site-manager/restaurants/${restaurantId}/approve`,
                {}
            )
        );
    }

    async rejectRestaurant(restaurantId: number): Promise<void> {
        await firstValueFrom(
            this.http.delete<ApiResponse<void>>(
                `${this.baseUrl}/site-manager/restaurants/${restaurantId}`
            )
        );
    }

    async updateRestaurantFees(
        restaurantId: number,
        data: { serviceFeePercent: number }
    ): Promise<void> {
        await firstValueFrom(
            this.http.patch<ApiResponse<void>>(
                `${this.baseUrl}/site-manager/restaurants/${restaurantId}`,
                data
            )
        );
    }
}
