import { Injectable, inject } from '@angular/core';
import { MenuItem, Restaurant } from '../customer.model';
import { CustomerService } from '../customer.service';

@Injectable({
    providedIn: 'root',
})
export class RestaurantService {
    private CustomerService = inject(CustomerService);

    async getRestaurants(): Promise<Restaurant[]> {
        return await this.CustomerService.getRestaurants();
    }

    async getRestaurantById(id: number): Promise<Restaurant> {
        return await this.CustomerService.getRestaurantById(id);
    }

    async getRestaurantMenu(restaurantId: number): Promise<MenuItem[]> {
        return await this.CustomerService.getRestaurantMenu(restaurantId);
    }

    async getRestaurantCategories(restaurantId: number): Promise<string[]> {
        return await this.CustomerService.getRestaurantCategories(restaurantId);
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
