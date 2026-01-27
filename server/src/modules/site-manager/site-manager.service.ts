import { getStatisticsRepository } from '../../domains/commons/repository-registry.js';
import type { DashboardStatistics } from '../../domains/commons/statistics.service.js';
import { StatisticsService } from '../../domains/commons/statistics.service.js';
import {
    PendingRestaurant,
    RestaurantService,
} from '../../domains/restaurant/restaurant.service.js';
import type { UserWithRoles } from '../../domains/user/user.repository.js';
import { UserService } from '../../domains/user/user.service.js';

export class SiteManagerService {
    private statisticsService = new StatisticsService(
        getStatisticsRepository()
    );
    private restaurantService = new RestaurantService();
    private userService = new UserService();

    async getDashboardStatistics(): Promise<DashboardStatistics> {
        return this.statisticsService.getDashboardStatistics();
    }

    async getPendingRestaurants(): Promise<PendingRestaurant[]> {
        return this.restaurantService.getPendingRestaurants();
    }

    async approveRestaurant(restaurantId: number): Promise<void> {
        return this.restaurantService.approveRestaurant(restaurantId);
    }

    async rejectRestaurant(restaurantId: number): Promise<void> {
        return this.restaurantService.rejectRestaurant(restaurantId);
    }

    async getAllUsers(): Promise<UserWithRoles[]> {
        return this.userService.getAllUsersWithRoles();
    }

    async setUserActiveStatus(
        userId: number,
        isActive: boolean,
        adminUserId: number
    ): Promise<void> {
        return this.userService.setActiveStatus(userId, isActive, adminUserId);
    }

    async updateRestaurantFees(
        restaurantId: number,
        data: { serviceFeePercent?: number; minOrderAmount?: number }
    ): Promise<void> {
        return this.restaurantService.updateRestaurantFees(restaurantId, data);
    }
}
