import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../model/api.model';

export const GRID_MIN = -10;
export const GRID_MAX = 10;

/** Address with grid coordinates (shared by users and restaurants) */
export interface Address {
    addressId: number;
    label: string;
    streetName: string;
    houseNumber: string;
    additionalInfo: string;
    cityName: string;
    zipCode: string;
    country: string;
    gridX: number;
    gridY: number;
}

export interface CreateAddress {
    label?: string;
    streetName: string;
    houseNumber: string;
    additionalInfo?: string;
    cityName: string;
    zipCode: string;
    country: string;
    gridX: number;
    gridY: number;
}

export interface UpdateAddress {
    label?: string;
    streetName?: string;
    houseNumber?: string;
    additionalInfo?: string;
    cityName?: string;
    zipCode?: string;
    country?: string;
    gridX?: number;
    gridY?: number;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
    private http = inject(HttpClient);
    private baseUrl = 'http://localhost:3000/api/addresses';

    async getUserAddresses(userId: number): Promise<Address[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<Address[]>>(
                `${this.baseUrl}/user/${userId}`
            )
        );
        return response.data;
    }

    /** Create a new address for the authenticated user */
    async createAddress(data: CreateAddress): Promise<{ addressId: number }> {
        const response = await firstValueFrom(
            this.http.post<ApiResponse<{ addressId: number }>>(
                this.baseUrl,
                data
            )
        );
        return response.data;
    }

    async updateAddress(addressId: number, data: UpdateAddress): Promise<void> {
        await firstValueFrom(
            this.http.put<ApiResponse<{ message: string }>>(
                `${this.baseUrl}/${addressId}`,
                data
            )
        );
    }

    async deleteAddress(addressId: number): Promise<void> {
        await firstValueFrom(
            this.http.delete<ApiResponse<{ message: string }>>(
                `${this.baseUrl}/${addressId}`
            )
        );
    }

    /** Get restaurant address (for owners) */
    async getRestaurantAddress(): Promise<Address | null> {
        try {
            const response = await firstValueFrom(
                this.http.get<ApiResponse<Address>>(
                    `${this.baseUrl}/restaurant`
                )
            );
            return response.data;
        } catch {
            return null;
        }
    }

    /** Update restaurant address (for owners) */
    async updateRestaurantAddress(data: UpdateAddress): Promise<void> {
        await firstValueFrom(
            this.http.put<ApiResponse<{ message: string }>>(
                `${this.baseUrl}/restaurant`,
                data
            )
        );
    }
}
