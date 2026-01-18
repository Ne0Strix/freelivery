import { Address } from '../location/address.service.js';
import { User } from '../user/user.service.js';
import {
    RestaurantRepository,
    type RestaurantRow,
} from './restaurant.repository.js';

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

/** DTO for creating a new restaurant */
export interface CreateRestaurant {
    name: string;
    description?: string;
    cuisineType: CuisineType;
    contactEmail: string;
    contactPhone: string;
    addressId: number;
    ownerUserId: number;
    deliveryZoneId: number;
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
        const row: Partial<RestaurantRow> = {
            name: dto.name,
            description: dto.description || '',
            cuisine_type: dto.cuisineType,
            contact_email: dto.contactEmail,
            contact_phone: dto.contactPhone,
            address_id: dto.addressId,
            owner_user_id: dto.ownerUserId,
            delivery_zone_id: dto.deliveryZoneId,
        };

        const result = await this.repository.query<{ restaurant_id: number }>(
            `INSERT INTO restaurant
             (name, status, description, cuisine_type, contact_email, contact_phone,
              address_id, owner_user_id, delivery_zone_id, service_fee_percent, min_order_amount,
              created_at, updated_at)
             VALUES ($1, 'NEW', $2, $3, $4, $5, $6, $7, $8, 0, 0, NOW(), NOW())
             RETURNING restaurant_id`,
            [
                row.name,
                row.description,
                row.cuisine_type,
                row.contact_email,
                row.contact_phone,
                row.address_id,
                row.owner_user_id,
                row.delivery_zone_id,
            ]
        );
        return result.rows[0].restaurant_id;
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
        });
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
}

/** DTO for updating restaurant details */
export interface UpdateRestaurantData {
    name?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
}
