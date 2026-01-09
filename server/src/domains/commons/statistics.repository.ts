import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { toAppError } from './errors.js';

export interface PlatformStatisticsRow {
    total_orders: string;
    total_revenue: string;
    total_users: string;
    active_users: string;
}

export class StatisticsRepository {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST ?? 'db',
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD,
            port: Number(
                process.env.POSTGRES_PORT ?? process.env.DB_PORT ?? 5432
            ),
        });
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

    private async query<R extends QueryResultRow = any>(
        text: string,
        values?: unknown[]
    ): Promise<QueryResult<R>> {
        try {
            return await this.pool.query<R>(text, values as any);
        } catch (err) {
            throw toAppError(err);
        }
    }
}
