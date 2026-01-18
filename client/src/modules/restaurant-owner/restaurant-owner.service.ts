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
