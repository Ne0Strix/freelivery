import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../commons/model/api.model';
import {
    OwnerRestaurant,
    UpdateRestaurant,
} from '../../commons/model/restaurant.model';
import {
    ChangePassword,
    UpdateProfile,
    UserProfile,
} from '../../commons/model/user.model';
import { AddressService } from '../../commons/services/address.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    private http = inject(HttpClient);
    private addressService = inject(AddressService);
    private baseUrl = 'http://localhost:3000/api/profile';

    async getProfile(): Promise<UserProfile> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<UserProfile>>(this.baseUrl)
        );
        return response.data;
    }

    async updateProfile(data: UpdateProfile): Promise<void> {
        await firstValueFrom(
            this.http.put<ApiResponse<{ message: string }>>(this.baseUrl, data)
        );
    }

    async changePassword(data: ChangePassword): Promise<void> {
        await firstValueFrom(
            this.http.put<ApiResponse<{ message: string }>>(
                `${this.baseUrl}/password`,
                data
            )
        );
    }

    async getRestaurant(): Promise<OwnerRestaurant | null> {
        try {
            const response = await firstValueFrom(
                this.http.get<ApiResponse<OwnerRestaurant>>(
                    `${this.baseUrl}/restaurant`
                )
            );
            return response.data;
        } catch {
            return null;
        }
    }

    async updateRestaurant(data: UpdateRestaurant): Promise<void> {
        await firstValueFrom(
            this.http.put<ApiResponse<{ message: string }>>(
                `${this.baseUrl}/restaurant`,
                data
            )
        );
    }

    // ========== Address Methods (delegated to AddressService) ==========

    get addresses() {
        return this.addressService;
    }
}
