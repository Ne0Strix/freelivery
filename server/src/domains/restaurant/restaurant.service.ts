import { User } from '../user/user.service.js';
import { Address } from '../location/address.service.js';
import { RestaurantRepository } from './restaurant.repository.js';

export interface Restaurant {
    restaurantId: number;
    name: string;
    description: string;
    cuisineType: CuisineType;
    contactEmail: string;
    contactPhone: string;
    address: Address;
    user: User;
    createdAt: Date;
    updatedAt: Date;
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

export enum RestaurantStatus {
    NEW = 'NEW',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export enum CuisineType {
    ITALIAN = 'ITALIAN',
    CHINESE = 'CHINESE',
    INDIAN = 'INDIAN',
    MEXICAN = 'MEXICAN',
    AMERICAN = 'AMERICAN',
    FRENCH = 'FRENCH',
    JAPANESE = 'JAPANESE',
    MEDITERRANEAN = 'MEDITERRANEAN',
    THAI = 'THAI',
    VIETNAMESE = 'VIETNAMESE',
    AUSTRIAN = 'AUSTRIAN',
}

export class RestaurantService {
    constructor(private repository: RestaurantRepository) {}

    async getActiveRestaurantsWithStats(): Promise<ActiveRestaurant[]> {
        const rows = await this.repository.getActiveWithStats();

        return rows.map((row) => ({
            restaurantId: row.restaurant_id,
            name: row.name,
            cuisineType: row.cuisine_type,
            address: `${row.street_name} ${row.house_number}, ${row.zip_code} ${row.city_name}`,
            orderCount: Number(row.order_count),
            totalRevenue: Number(row.total_revenue),
        }));
    }

    async getPendingRestaurants(): Promise<PendingRestaurant[]> {
        const rows = await this.repository.getPendingWithOwnerDetails();

        return rows.map((row) => ({
            restaurantId: row.restaurant_id,
            name: row.name,
            cuisineType: row.cuisine_type,
            ownerEmail: row.owner_email,
            ownerUsername: row.owner_username,
            registeredAt: new Date(row.created_at),
        }));
    }
}
