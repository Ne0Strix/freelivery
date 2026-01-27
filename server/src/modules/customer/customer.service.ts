import { getCustomerRepository } from '../../domains/commons/repository-registry.js';
import type { MenuItemRow } from './customer.repository.js';

export interface MenuItem {
    dishId: number;
    categoryId: number;
    categoryName: string;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
}

export class CustomerService {
    private repository = getCustomerRepository();

    async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
        const rows =
            await this.repository.getMenuItemsByRestaurant(restaurantId);
        return rows.map(this.toMenuItem);
    }

    private toMenuItem(row: MenuItemRow): MenuItem {
        return {
            dishId: row.dish_id,
            categoryId: row.category_id,
            categoryName: row.category_name,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            isAvailable: row.is_available,
        };
    }
}
