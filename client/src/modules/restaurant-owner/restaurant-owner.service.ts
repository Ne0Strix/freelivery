import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../../commons/model/api.model';
import { Category, Dish } from '../../commons/model/restaurant.model';

// =====================
// Category DTOs
// =====================

export interface CreateCategory {
    name: string;
    description?: string;
}

export interface UpdateCategory {
    name?: string;
    description?: string;
}

// =====================
// Dish DTOs
// =====================

export interface CreateDish {
    categoryId: number;
    name: string;
    description?: string;
    price: number;
    photo?: File;
}

export interface UpdateDish {
    categoryId?: number;
    name?: string;
    description?: string;
    price?: number;
    photo?: File;
    removeImage?: boolean;
}

export interface MyRestaurant {
    restaurantId: number;
    name: string;
    status: string;
}

// =====================
// Order DTOs
// =====================

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

export interface RestaurantOrderItem {
    orderItemId: number;
    dishId: number;
    dishName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
}

export interface RestaurantOrder {
    orderId: number;
    status: OrderStatus;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    deliveryAddress: string;
    items: RestaurantOrderItem[];
    subtotalAmount: number;
    serviceFeeAmount: number;
    discountAmount: number;
    totalAmount: number;
    paymentMethod: string;
    estimatedDeliveryTime: Date | null;
    createdAt: Date;
}

// =====================
// Opening Hours DTOs
// =====================

export interface OpeningHours {
    openingHoursId: number;
    restaurantId: number;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
}

export interface CreateOpeningHours {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
}

export interface UpdateOpeningHours {
    dayOfWeek?: number;
    openTime?: string;
    closeTime?: string;
}

@Injectable({
    providedIn: 'root',
})
export class RestaurantOwnerService {
    private http = inject(HttpClient);
    private baseUrl = '/api/restaurant-owner';

    // =====================
    // Restaurant Info
    // =====================

    async getMyRestaurant(): Promise<MyRestaurant> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<MyRestaurant>>(
                `${this.baseUrl}/my-restaurant`
            )
        );
        return response.data;
    }

    // =====================
    // Category Methods
    // =====================

    async createCategory(dto: CreateCategory): Promise<Category> {
        const response = await firstValueFrom(
            this.http.post<ApiResponse<Category>>(
                `${this.baseUrl}/menu/categories`,
                dto
            )
        );
        return response.data;
    }

    async updateCategory(
        categoryId: number,
        dto: UpdateCategory
    ): Promise<Category> {
        const response = await firstValueFrom(
            this.http.put<ApiResponse<Category>>(
                `${this.baseUrl}/menu/categories/${categoryId}`,
                dto
            )
        );
        return response.data;
    }

    async deleteCategory(categoryId: number): Promise<void> {
        await firstValueFrom(
            this.http.delete<ApiResponse<{ message: string }>>(
                `${this.baseUrl}/menu/categories/${categoryId}`
            )
        );
    }

    // =====================
    // Dish Methods
    // =====================

    async createDish(dto: CreateDish): Promise<Dish> {
        const formData = this.buildDishFormData(dto);
        const response = await firstValueFrom(
            this.http.post<ApiResponse<Dish>>(
                `${this.baseUrl}/menu/dishes`,
                formData
            )
        );
        return response.data;
    }

    async updateDish(dishId: number, dto: UpdateDish): Promise<Dish> {
        const formData = this.buildDishFormData(dto);
        const response = await firstValueFrom(
            this.http.put<ApiResponse<Dish>>(
                `${this.baseUrl}/menu/dishes/${dishId}`,
                formData
            )
        );
        return response.data;
    }

    async deleteDish(dishId: number): Promise<void> {
        await firstValueFrom(
            this.http.delete<ApiResponse<{ message: string }>>(
                `${this.baseUrl}/menu/dishes/${dishId}`
            )
        );
    }

    async toggleDishAvailability(dishId: number): Promise<Dish> {
        const response = await firstValueFrom(
            this.http.patch<ApiResponse<Dish>>(
                `${this.baseUrl}/menu/dishes/${dishId}/availability`,
                {}
            )
        );
        return response.data;
    }

    // =====================
    // Order Methods
    // =====================

    async getOrders(): Promise<RestaurantOrder[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<RestaurantOrder[]>>(
                `${this.baseUrl}/orders`
            )
        );
        return response.data;
    }

    async updateOrderStatus(
        orderId: number,
        status: OrderStatus
    ): Promise<RestaurantOrder> {
        const response = await firstValueFrom(
            this.http.patch<ApiResponse<RestaurantOrder>>(
                `${this.baseUrl}/orders/${orderId}/status`,
                { status }
            )
        );
        return response.data;
    }

    // =====================
    // Opening Hours Methods
    // =====================

    async getOpeningHours(): Promise<OpeningHours[]> {
        const response = await firstValueFrom(
            this.http.get<ApiResponse<OpeningHours[]>>(
                `${this.baseUrl}/opening-hours`
            )
        );
        return response.data;
    }

    async createOpeningHours(dto: CreateOpeningHours): Promise<OpeningHours> {
        const response = await firstValueFrom(
            this.http.post<ApiResponse<OpeningHours>>(
                `${this.baseUrl}/opening-hours`,
                dto
            )
        );
        return response.data;
    }

    async updateOpeningHours(
        openingHoursId: number,
        dto: UpdateOpeningHours
    ): Promise<OpeningHours> {
        const response = await firstValueFrom(
            this.http.put<ApiResponse<OpeningHours>>(
                `${this.baseUrl}/opening-hours/${openingHoursId}`,
                dto
            )
        );
        return response.data;
    }

    async deleteOpeningHours(openingHoursId: number): Promise<void> {
        await firstValueFrom(
            this.http.delete<ApiResponse<{ message: string }>>(
                `${this.baseUrl}/opening-hours/${openingHoursId}`
            )
        );
    }

    // =====================
    // Helper Methods
    // =====================

    private buildDishFormData(dto: CreateDish | UpdateDish): FormData {
        const formData = new FormData();

        if ('categoryId' in dto && dto.categoryId !== undefined) {
            formData.append('categoryId', String(dto.categoryId));
        }
        if (dto.name !== undefined) {
            formData.append('name', dto.name);
        }
        if (dto.description !== undefined) {
            formData.append('description', dto.description);
        }
        if (dto.price !== undefined) {
            formData.append('price', String(dto.price));
        }
        if (dto.photo) {
            formData.append('photo', dto.photo);
        }
        if ('removeImage' in dto && dto.removeImage) {
            formData.append('removeImage', 'true');
        }

        return formData;
    }
}
