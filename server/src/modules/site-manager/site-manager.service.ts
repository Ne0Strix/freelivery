import { StatisticsRepository } from '../../domains/commons/statistics.repository.js';
import {
    DashboardStatistics,
    StatisticsService,
} from '../../domains/commons/statistics.service.js';
import { RestaurantRepository } from '../../domains/restaurant/restaurant.repository.js';
import {
    PendingRestaurant,
    RestaurantService,
} from '../../domains/restaurant/restaurant.service.js';

export class SiteManagerService {
    private statisticsService: StatisticsService;
    private restaurantService: RestaurantService;

    constructor() {
        this.statisticsService = new StatisticsService(
            new StatisticsRepository()
        );
        this.restaurantService = new RestaurantService(
            new RestaurantRepository()
        );
    }

    async getDashboardStatistics(): Promise<DashboardStatistics> {
        return this.statisticsService.getDashboardStatistics();
    }

    async getPendingRestaurants(): Promise<PendingRestaurant[]> {
        return this.restaurantService.getPendingRestaurants();
    }
}
