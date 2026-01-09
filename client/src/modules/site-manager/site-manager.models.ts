export interface DashboardStatistics {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    activeUsers: number;
}

export interface ActiveRestaurant {
    restaurantId: number;
    name: string;
    cuisineType: string;
    address: string;
    orderCount: number;
    totalRevenue: number;
}

export interface PendingRestaurant {
    restaurantId: number;
    name: string;
    cuisineType: string;
    ownerEmail: string;
    ownerUsername: string;
    registeredAt: Date;
}
