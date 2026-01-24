import {
    calculateDeliveryMinutes,
    calculateManhattanDistance,
    GridCoordinates,
} from '../location/address.service.js';
import { RestaurantRepository } from './restaurant.repository.js';

export interface Restaurant {
    restaurantId: number;
    name: string;
    description: string;
    cuisineType: CuisineType;
    contactEmail: string;
    contactPhone: string;
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
    serviceFeePercent: number;
    minOrderAmount: number;
}

/** Restaurant with delivery info for customer view */
export interface RestaurantWithDelivery {
    restaurantId: number;
    name: string;
    cuisineType: string;
    address: string;
    maxDeliveryDistance: number;
    estimatedDeliveryMinutes: number | null;
    canDeliver: boolean;
}

export interface PendingRestaurant {
    restaurantId: number;
    name: string;
    cuisineType: string;
    ownerEmail: string;
    ownerUsername: string;
    registeredAt: Date;
}

/** DTO for creating a new restaurant */
export interface CreateRestaurant {
    name: string;
    description?: string;
    cuisineType: CuisineType;
    contactEmail: string;
    contactPhone: string;
    addressId: number;
    ownerUserId: number;
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

    /** Create a new restaurant with NEW status (pending approval) */
    async createRestaurant(dto: CreateRestaurant): Promise<number> {
        const row = await this.repository.create({
            name: dto.name,
            description: dto.description || '',
            cuisine_type: dto.cuisineType,
            contact_email: dto.contactEmail,
            contact_phone: dto.contactPhone,
            address_id: dto.addressId,
            owner_user_id: dto.ownerUserId,
        });
        return row.restaurant_id;
    }

    async getActiveRestaurantsWithStats(): Promise<ActiveRestaurant[]> {
        const rows = await this.repository.getActiveWithStats();

        return rows.map((row) => ({
            restaurantId: row.restaurant_id,
            name: row.name,
            cuisineType: row.cuisine_type,
            address: `${row.street_name} ${row.house_number}, ${row.zip_code} ${row.city_name}`,
            orderCount: Number(row.order_count),
            totalRevenue: Number(row.total_revenue),
            serviceFeePercent: Number(row.service_fee_percent),
            minOrderAmount: Number(row.min_order_amount),
        }));
    }

    /**
     * Get active restaurants with delivery time calculation for a customer location.
     * If customerLocation is provided, calculates delivery time and filters by delivery range.
     * If not provided, returns all active restaurants without delivery filtering.
     */
    async getActiveRestaurantsForCustomer(
        customerLocation?: GridCoordinates
    ): Promise<RestaurantWithDelivery[]> {
        const rows = await this.repository.getActiveWithStats();

        return rows.map((row) => {
            const restaurantLocation: GridCoordinates | null =
                row.grid_x !== null && row.grid_y !== null
                    ? { gridX: row.grid_x, gridY: row.grid_y }
                    : null;

            let estimatedDeliveryMinutes: number | null = null;
            let canDeliver = true;

            if (customerLocation && restaurantLocation) {
                const distance = calculateManhattanDistance(
                    restaurantLocation,
                    customerLocation
                );
                estimatedDeliveryMinutes = calculateDeliveryMinutes(
                    restaurantLocation,
                    customerLocation
                );
                canDeliver = distance <= row.max_delivery_distance;
            }

            return {
                restaurantId: row.restaurant_id,
                name: row.name,
                cuisineType: row.cuisine_type,
                address: `${row.street_name} ${row.house_number}, ${row.zip_code} ${row.city_name}`,
                maxDeliveryDistance: row.max_delivery_distance,
                estimatedDeliveryMinutes,
                canDeliver,
            };
        });
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

    async approveRestaurant(restaurantId: number): Promise<void> {
        await this.repository.updateStatus(
            restaurantId,
            RestaurantStatus.ACTIVE
        );
    }

    async rejectRestaurant(restaurantId: number): Promise<void> {
        await this.repository.deleteById(restaurantId);
    }

    /** Get restaurant by owner user ID */
    async getRestaurantByOwner(
        ownerUserId: number
    ): Promise<OwnerRestaurant | null> {
        const row = await this.repository.findByOwnerId(ownerUserId);
        if (!row) return null;

        return {
            restaurantId: row.restaurant_id,
            name: row.name,
            description: row.description,
            cuisineType: row.cuisine_type as CuisineType,
            contactEmail: row.contact_email,
            contactPhone: row.contact_phone,
            status: row.status,
            maxDeliveryDistance: row.max_delivery_distance,
            minOrderAmount: Number(row.min_order_amount),
        };
    }

    /** Update restaurant details (for owner) */
    async updateRestaurantDetails(
        restaurantId: number,
        ownerUserId: number,
        data: UpdateRestaurantData
    ): Promise<void> {
        // Verify ownership
        const restaurant = await this.repository.getByIdOrThrow(restaurantId, {
            message: 'Restaurant not found',
        });
        if (restaurant.owner_user_id !== ownerUserId) {
            throw new Error('Not authorized to update this restaurant');
        }

        await this.repository.updateDetails(restaurantId, {
            name: data.name,
            description: data.description,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            maxDeliveryDistance: data.maxDeliveryDistance,
            minOrderAmount: data.minOrderAmount,
        });
    }

    /** Update restaurant fees (admin only) */
    async updateRestaurantFees(
        restaurantId: number,
        data: { serviceFeePercent?: number; minOrderAmount?: number }
    ): Promise<void> {
        await this.repository.getByIdOrThrow(restaurantId, {
            message: 'Restaurant not found',
        });
        await this.repository.updateFees(restaurantId, data);
    }
}

/** DTO for restaurant owner's view of their restaurant */
export interface OwnerRestaurant {
    restaurantId: number;
    name: string;
    description: string;
    cuisineType: CuisineType;
    contactEmail: string;
    contactPhone: string;
    status: RestaurantStatus;
    maxDeliveryDistance: number;
    minOrderAmount: number;
}

/** DTO for updating restaurant details */
export interface UpdateRestaurantData {
    name?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    maxDeliveryDistance?: number;
    minOrderAmount?: number;
}
