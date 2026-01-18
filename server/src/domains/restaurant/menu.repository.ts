import { Repository } from '../commons/abstract-repository.js';

// =====================
// Category Row & Repository
// =====================

export interface CategoryRow {
    category_id: number;
    restaurant_id: number;
    name: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
}

export class CategoryRepository extends Repository<CategoryRow> {
    constructor() {
        super('category', 'category_id');
    }

    async create(item: Partial<CategoryRow>): Promise<CategoryRow> {
        const query = `
            INSERT INTO ${this.tableName}
            (restaurant_id, name, description, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *
        `;
        const result = await this.query<CategoryRow>(query, [
            item.restaurant_id,
            item.name,
            item.description ?? null,
        ]);
        return result.rows[0];
    }

    async update(id: number, item: Partial<CategoryRow>): Promise<CategoryRow> {
        const query = `
            UPDATE ${this.tableName}
            SET name = COALESCE($2, name),
                description = COALESCE($3, description),
                updated_at = NOW()
            WHERE ${this.primaryKey} = $1
            RETURNING *
        `;
        const result = await this.query<CategoryRow>(query, [
            id,
            item.name,
            item.description,
        ]);
        return result.rows[0];
    }

    async getByRestaurantId(restaurantId: number): Promise<CategoryRow[]> {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE restaurant_id = $1
            ORDER BY name
        `;
        const result = await this.query<CategoryRow>(query, [restaurantId]);
        return result.rows;
    }
}

// =====================
// Dish Row & Repository
// =====================

export interface DishRow {
    dish_id: number;
    restaurant_id: number;
    category_id: number;
    name: string;
    description: string | null;
    price: string; // DECIMAL comes as string from pg
    image_url: string | null;
    is_available: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface DishWithCategoryRow extends DishRow {
    category_name: string;
}

export class DishRepository extends Repository<DishRow> {
    constructor() {
        super('dish', 'dish_id');
    }

    async create(item: Partial<DishRow>): Promise<DishRow> {
        const query = `
            INSERT INTO ${this.tableName}
            (restaurant_id, category_id, name, description, price, image_url, is_available, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *
        `;
        const result = await this.query<DishRow>(query, [
            item.restaurant_id,
            item.category_id,
            item.name,
            item.description ?? null,
            item.price,
            item.image_url ?? null,
            item.is_available ?? true,
        ]);
        return result.rows[0];
    }

    async update(id: number, item: Partial<DishRow>): Promise<DishRow> {
        const setClauses: string[] = [];
        const values: unknown[] = [id];
        let paramIndex = 2;

        if (item.category_id !== undefined) {
            setClauses.push(`category_id = $${paramIndex++}`);
            values.push(item.category_id);
        }
        if (item.name !== undefined) {
            setClauses.push(`name = $${paramIndex++}`);
            values.push(item.name);
        }
        if (item.description !== undefined) {
            setClauses.push(`description = $${paramIndex++}`);
            values.push(item.description);
        }
        if (item.price !== undefined) {
            setClauses.push(`price = $${paramIndex++}`);
            values.push(item.price);
        }
        if (item.image_url !== undefined) {
            setClauses.push(`image_url = $${paramIndex++}`);
            values.push(item.image_url);
        }
        if (item.is_available !== undefined) {
            setClauses.push(`is_available = $${paramIndex++}`);
            values.push(item.is_available);
        }

        setClauses.push('updated_at = NOW()');

        const query = `
            UPDATE ${this.tableName}
            SET ${setClauses.join(', ')}
            WHERE ${this.primaryKey} = $1
            RETURNING *
        `;
        const result = await this.query<DishRow>(query, values);
        return result.rows[0];
    }

    async getByRestaurantId(
        restaurantId: number
    ): Promise<DishWithCategoryRow[]> {
        const query = `
            SELECT d.*, c.name AS category_name
            FROM ${this.tableName} d
            JOIN category c ON d.category_id = c.category_id
            WHERE d.restaurant_id = $1
            ORDER BY c.name, d.name
        `;
        const result = await this.query<DishWithCategoryRow>(query, [
            restaurantId,
        ]);
        return result.rows;
    }

    async getByCategoryId(categoryId: number): Promise<DishRow[]> {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE category_id = $1
            ORDER BY name
        `;
        const result = await this.query<DishRow>(query, [categoryId]);
        return result.rows;
    }

    async updateAvailability(
        id: number,
        isAvailable: boolean
    ): Promise<DishRow> {
        const query = `
            UPDATE ${this.tableName}
            SET is_available = $2, updated_at = NOW()
            WHERE ${this.primaryKey} = $1
            RETURNING *
        `;
        const result = await this.query<DishRow>(query, [id, isAvailable]);
        return result.rows[0];
    }
}
