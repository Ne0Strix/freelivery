import { ForbiddenError, ValidationError } from '../commons/errors.js';
import {
    getAddressRepository,
    getRestaurantRepository,
    getUserRepository,
} from '../commons/repository-registry.js';
import type { AddressRow } from './address.repository.js';

export interface Address {
    addressId: number;
    label: string;
    streetName: string;
    houseNumber: string;
    additionalInfo: string;
    cityName: string;
    zipCode: string;
    country: string;
    gridX: number | null;
    gridY: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateAddress {
    label?: string;
    streetName: string;
    houseNumber: string;
    additionalInfo?: string;
    cityName: string;
    zipCode: string;
    country: string;
    gridX?: number;
    gridY?: number;
}

export interface UpdateAddress {
    label?: string;
    streetName?: string;
    houseNumber?: string;
    additionalInfo?: string;
    cityName?: string;
    zipCode?: string;
    country?: string;
    gridX?: number;
    gridY?: number;
}

export interface GridCoordinates {
    gridX: number;
    gridY: number;
}

/** Minutes per grid step for delivery time calculation */
const MINUTES_PER_STEP = 5;

/**
 * Calculate Manhattan distance between two grid coordinates.
 * Distance = |x1 - x2| + |y1 - y2|
 */
export function calculateManhattanDistance(
    from: GridCoordinates,
    to: GridCoordinates
): number {
    return Math.abs(from.gridX - to.gridX) + Math.abs(from.gridY - to.gridY);
}

/**
 * Calculate estimated delivery time in minutes based on Manhattan distance.
 * Uses 5 minutes per grid step.
 */
export function calculateDeliveryMinutes(
    from: GridCoordinates,
    to: GridCoordinates
): number {
    const distance = calculateManhattanDistance(from, to);
    return distance * MINUTES_PER_STEP;
}

export class AddressService {
    private repository = getAddressRepository();
    private userRepository = getUserRepository();
    private restaurantRepository = getRestaurantRepository();

    async createAddress(dto: CreateAddress): Promise<number> {
        const row = await this.repository.create({
            label: dto.label,
            street_name: dto.streetName,
            house_number: dto.houseNumber,
            additional_info: dto.additionalInfo,
            city_name: dto.cityName,
            zip_code: dto.zipCode,
            country: dto.country,
            grid_x: dto.gridX ?? null,
            grid_y: dto.gridY ?? null,
        } as Partial<AddressRow>);
        return row.address_id;
    }

    /** Update an existing address - checks ownership before updating */
    async updateAddress(
        userId: number,
        addressId: number,
        dto: UpdateAddress
    ): Promise<void> {
        // Check if user owns this address (directly or via restaurant)
        const canAccess = await this.userCanAccessAddress(userId, addressId);
        if (!canAccess) {
            throw new ForbiddenError(
                'You do not have permission to update this address'
            );
        }

        await this.repository.update(addressId, {
            label: dto.label,
            street_name: dto.streetName,
            house_number: dto.houseNumber,
            additional_info: dto.additionalInfo,
            city_name: dto.cityName,
            zip_code: dto.zipCode,
            country: dto.country,
            grid_x: dto.gridX,
            grid_y: dto.gridY,
        });
    }

    async getById(addressId: number): Promise<Address | null> {
        const row = await this.repository.getById(addressId);
        if (!row) return null;
        return this.rowToDto(row);
    }

    public getAllForUser(userId: number): Promise<Address[]> {
        return this.repository.getAllForUser(userId).then((rows) => {
            return rows.map((row) => this.rowToDto(row));
        });
    }

    private rowToDto(row: AddressRow): Address {
        return {
            addressId: row.address_id,
            label: row.label,
            streetName: row.street_name,
            houseNumber: row.house_number,
            additionalInfo: row.additional_info,
            cityName: row.city_name,
            zipCode: row.zip_code,
            country: row.country,
            gridX: row.grid_x,
            gridY: row.grid_y,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }

    public validateGridCoordinate(
        value: unknown,
        fieldName: string
    ): number | undefined {
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        const num = Number(value);
        if (!Number.isInteger(num) || num < -10 || num > 10) {
            throw new ValidationError(
                `${fieldName} must be an integer between -10 and 10`
            );
        }
        return num;
    }

    /** Delete an address - unlinks from all users then removes the address record */
    async deleteAddress(userId: number, addressId: number): Promise<void> {
        // Check if user owns this address
        const ownsAddress = await this.userRepository.userOwnsAddress(
            userId,
            addressId
        );
        if (!ownsAddress) {
            throw new ForbiddenError(
                'You do not have permission to delete this address'
            );
        }

        // Unlink address from user
        await this.userRepository.unlinkUserAddress(userId, addressId);

        // Delete the address itself
        await this.repository.deleteById(addressId);
    }

    /**
     * Check if user owns an address - either directly (user_address link)
     * or via restaurant ownership
     */
    private async userCanAccessAddress(
        userId: number,
        addressId: number
    ): Promise<boolean> {
        // Check direct ownership via user_address
        const ownsDirectly = await this.userRepository.userOwnsAddress(
            userId,
            addressId
        );
        if (ownsDirectly) return true;

        // Check ownership via restaurant
        const restaurant =
            await this.restaurantRepository.findByOwnerId(userId);
        if (restaurant && restaurant.address_id === addressId) return true;

        return false;
    }
}
