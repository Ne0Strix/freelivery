import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../commons/model/api.model';
import {
    ActiveRestaurant,
    DashboardStatistics,
    PendingRestaurant,
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

    async getActiveRestaurants(): Promise<ActiveRestaurant[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<ActiveRestaurant[]>>(
                `${this.baseUrl}/restaurants/active`
            )
        );
        return response.data;
    }

    async getPendingRestaurants(): Promise<PendingRestaurant[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<PendingRestaurant[]>>(
                `${this.baseUrl}/site-manager/restaurants/pending`
            )
        );
        return response.data;
    }
}
