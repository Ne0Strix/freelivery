export interface DashboardStatistics {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    activeUsers: number;
}

export interface PendingRestaurant {
    restaurantId: number;
    name: string;
    cuisineType: string;
    ownerEmail: string;
    ownerUsername: string;
    registeredAt: Date;
}
