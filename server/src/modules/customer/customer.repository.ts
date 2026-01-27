import type { QueryResultRow } from 'pg';
import { Repository } from '../../domains/commons/abstract-repository.js';

export interface MenuItemRow extends QueryResultRow {
    dish_id: number;
    category_id: number;
    category_name: string;
    name: string;
    description: string;
    price: string;
    is_available: boolean;
}

export class CustomerRepository extends Repository<MenuItemRow> {
    constructor() {
        super('', '');
    }

    async getMenuItemsByRestaurant(
        restaurantId: number
    ): Promise<MenuItemRow[]> {
        const query = `
            SELECT 
                d.dish_id,
                d.category_id,
                c.name AS category_name,
                d.name,
                d.description,
                d.price,
                d.is_available
            FROM dish d
            JOIN category c ON d.category_id = c.category_id
            WHERE d.restaurant_id = $1 AND d.is_available = true
            ORDER BY c.name, d.name
        `;
        const result = await this.query<MenuItemRow>(query, [restaurantId]);
        return result.rows;
    }

    create(): Promise<MenuItemRow> {
        throw new Error('Not implemented for CustomerRepository');
    }

    update(): Promise<MenuItemRow> {
        throw new Error('Not implemented for CustomerRepository');
    }
}
