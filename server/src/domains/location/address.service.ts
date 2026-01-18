import { AddressRepository, type AddressRow } from './address.repository.js';

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

/** DTO for creating a new address */
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

/** DTO for updating an address */
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

/** Grid coordinates for delivery calculations */
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
    constructor(private repository: AddressRepository) {}

    /** Create a new address and return its ID */
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

    /** Update an existing address */
    async updateAddress(addressId: number, dto: UpdateAddress): Promise<void> {
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

    /** Get address by ID */
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
}
