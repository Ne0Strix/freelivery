import { Injectable, inject } from '@angular/core';
import { MenuItem, Restaurant } from '../customer.model';
import { CustomerService } from '../customer.service';

@Injectable({
    providedIn: 'root',
})
export class RestaurantBrowsingService {
    private customerService = inject(CustomerService);

    async getRestaurants(): Promise<Restaurant[]> {
        return await this.customerService.getRestaurants();
    }

    async getRestaurantById(id: number): Promise<Restaurant> {
        return await this.customerService.getRestaurantById(id);
    }

    async getRestaurantMenu(restaurantId: number): Promise<MenuItem[]> {
        return await this.customerService.getRestaurantMenu(restaurantId);
    }

    async getRestaurantCategories(restaurantId: number): Promise<string[]> {
        return await this.customerService.getRestaurantCategories(restaurantId);
    }

    async getRestaurantWithMenu(restaurantId: number): Promise<{
        restaurant: Restaurant;
        menu: MenuItem[];
        categories: string[];
    }> {
        const [restaurant, menu, categories] = await Promise.all([
            this.getRestaurantById(restaurantId),
            this.getRestaurantMenu(restaurantId),
            this.getRestaurantCategories(restaurantId),
        ]);
        return { restaurant, menu, categories };
    }
}
