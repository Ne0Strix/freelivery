import { StatisticsRepository } from './statistics.repository.js';

export interface DashboardStatistics {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    activeUsers: number;
}

export class StatisticsService {
    constructor(private repository: StatisticsRepository) {}

    async getDashboardStatistics(): Promise<DashboardStatistics> {
        const row = await this.repository.getPlatformStatistics();

        return {
            totalOrders: Number(row.total_orders),
            totalRevenue: Number(row.total_revenue),
            totalUsers: Number(row.total_users),
            activeUsers: Number(row.active_users),
        };
    }
}
