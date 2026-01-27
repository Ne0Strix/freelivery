import type { QueryResultRow } from 'pg';
import { Repository } from './abstract-repository.js';

export interface PlatformStatisticsRow extends QueryResultRow {
    total_orders: string;
    total_revenue: string;
    total_users: string;
    active_users: string;
}

export class StatisticsRepository extends Repository<PlatformStatisticsRow> {
    constructor() {
        super('', '');
    }

    async getPlatformStatistics(): Promise<PlatformStatisticsRow> {
        const query = `
            SELECT
                (SELECT COUNT(*) FROM "order") AS total_orders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM "order") AS total_revenue,
                (SELECT COUNT(*) FROM "user") AS total_users,
                (SELECT COUNT(DISTINCT customer_user_id) FROM "order") AS active_users
        `;

        const result = await this.query<PlatformStatisticsRow>(query);
        return result.rows[0];
    }

    create(): Promise<PlatformStatisticsRow> {
        throw new Error('Not implemented for StatisticsRepository');
    }

    update(): Promise<PlatformStatisticsRow> {
        throw new Error('Not implemented for StatisticsRepository');
    }
}
