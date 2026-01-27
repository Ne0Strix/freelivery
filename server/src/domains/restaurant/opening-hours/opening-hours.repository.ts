import { Repository } from '../../commons/abstract-repository.js';

export interface OpeningHoursRow {
    opening_hours_id: number;
    restaurant_id: number;
    day_of_week: number;
    open_time: string;
    close_time: string;
    created_at: Date;
    updated_at: Date;
}

export class OpeningHoursRepository extends Repository<OpeningHoursRow> {
    constructor() {
        super('opening_hours', 'opening_hours_id');
    }

    async create(item: Partial<OpeningHoursRow>): Promise<OpeningHoursRow> {
        const query = `
            INSERT INTO ${this.tableName}
            (restaurant_id, day_of_week, open_time, close_time, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
        `;
        const result = await this.query<OpeningHoursRow>(query, [
            item.restaurant_id,
            item.day_of_week,
            item.open_time,
            item.close_time,
        ]);
        return result.rows[0];
    }

    async update(
        id: number,
        item: Partial<OpeningHoursRow>
    ): Promise<OpeningHoursRow> {
        const query = `
            UPDATE ${this.tableName}
            SET day_of_week = COALESCE($1, day_of_week),
                open_time = COALESCE($2, open_time),
                close_time = COALESCE($3, close_time),
                updated_at = NOW()
            WHERE ${this.primaryKey} = $4
            RETURNING *
        `;
        const result = await this.query<OpeningHoursRow>(query, [
            item.day_of_week,
            item.open_time,
            item.close_time,
            id,
        ]);
        return result.rows[0];
    }

    async getByRestaurantId(restaurantId: number): Promise<OpeningHoursRow[]> {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE restaurant_id = $1
            ORDER BY day_of_week, open_time
        `;
        const result = await this.query<OpeningHoursRow>(query, [restaurantId]);
        return result.rows;
    }

    async getByRestaurantIdAndDay(
        restaurantId: number,
        dayOfWeek: number
    ): Promise<OpeningHoursRow[]> {
        const query = `
            SELECT * FROM ${this.tableName}
            WHERE restaurant_id = $1 AND day_of_week = $2
            ORDER BY open_time
        `;
        const result = await this.query<OpeningHoursRow>(query, [
            restaurantId,
            dayOfWeek,
        ]);
        return result.rows;
    }
}
