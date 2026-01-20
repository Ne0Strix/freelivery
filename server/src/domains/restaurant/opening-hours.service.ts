import {
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from '../commons/errors.js';
import {
    OpeningHoursRepository,
    OpeningHoursRow,
} from './opening-hours.repository.js';
import { RestaurantRepository } from './restaurant.repository.js';

// =====================
// Opening Hours DTO
// =====================

export interface OpeningHours {
    openingHoursId: number;
    restaurantId: number;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
}

export interface CreateOpeningHours {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
}

export interface UpdateOpeningHours {
    dayOfWeek?: number;
    openTime?: string;
    closeTime?: string;
}

// =====================
// Row → DTO Transform
// =====================

function rowToDto(row: OpeningHoursRow): OpeningHours {
    return {
        openingHoursId: row.opening_hours_id,
        restaurantId: row.restaurant_id,
        dayOfWeek: row.day_of_week,
        openTime: row.open_time,
        closeTime: row.close_time,
    };
}

// =====================
// Overlap Detection
// =====================

function timesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
): boolean {
    return start1 < end2 && start2 < end1;
}

// =====================
// Service
// =====================

export class OpeningHoursService {
    constructor(
        private openingHoursRepository: OpeningHoursRepository,
        private restaurantRepository: RestaurantRepository
    ) {}

    /** Get restaurant by owner, throws if not found */
    async getOwnerRestaurant(ownerUserId: number) {
        const restaurant =
            await this.restaurantRepository.findByOwnerId(ownerUserId);
        if (!restaurant) {
            throw new NotFoundError('No restaurant found for this owner');
        }
        return restaurant;
    }

    /** Get all opening hours for the owner's restaurant */
    async getAllForOwner(ownerUserId: number): Promise<OpeningHours[]> {
        const restaurant = await this.getOwnerRestaurant(ownerUserId);
        const rows = await this.openingHoursRepository.getByRestaurantId(
            restaurant.restaurant_id
        );
        return rows.map(rowToDto);
    }

    /** Create a new opening hours slot */
    async create(
        ownerUserId: number,
        data: CreateOpeningHours
    ): Promise<OpeningHours> {
        const restaurant = await this.getOwnerRestaurant(ownerUserId);

        await this.checkOverlap(
            restaurant.restaurant_id,
            data.dayOfWeek,
            data.openTime,
            data.closeTime
        );

        const row = await this.openingHoursRepository.create({
            restaurant_id: restaurant.restaurant_id,
            day_of_week: data.dayOfWeek,
            open_time: data.openTime,
            close_time: data.closeTime,
        });

        return rowToDto(row);
    }

    /** Update an existing opening hours slot */
    async update(
        ownerUserId: number,
        openingHoursId: number,
        data: UpdateOpeningHours
    ): Promise<OpeningHours> {
        const restaurant = await this.getOwnerRestaurant(ownerUserId);
        const existing =
            await this.openingHoursRepository.getById(openingHoursId);

        if (!existing) {
            throw new NotFoundError('Opening hours slot not found');
        }

        if (existing.restaurant_id !== restaurant.restaurant_id) {
            throw new ForbiddenError('You do not own this opening hours slot');
        }

        const newDayOfWeek = data.dayOfWeek ?? existing.day_of_week;
        const newOpenTime = data.openTime ?? existing.open_time;
        const newCloseTime = data.closeTime ?? existing.close_time;

        await this.checkOverlap(
            restaurant.restaurant_id,
            newDayOfWeek,
            newOpenTime,
            newCloseTime,
            openingHoursId
        );

        const row = await this.openingHoursRepository.update(openingHoursId, {
            day_of_week: data.dayOfWeek,
            open_time: data.openTime,
            close_time: data.closeTime,
        });

        return rowToDto(row);
    }

    /** Delete an opening hours slot */
    async delete(ownerUserId: number, openingHoursId: number): Promise<void> {
        const restaurant = await this.getOwnerRestaurant(ownerUserId);
        const existing =
            await this.openingHoursRepository.getById(openingHoursId);

        if (!existing) {
            throw new NotFoundError('Opening hours slot not found');
        }

        if (existing.restaurant_id !== restaurant.restaurant_id) {
            throw new ForbiddenError('You do not own this opening hours slot');
        }

        await this.openingHoursRepository.deleteById(openingHoursId);
    }

    /** Check for overlapping time slots on the same day */
    private async checkOverlap(
        restaurantId: number,
        dayOfWeek: number,
        openTime: string,
        closeTime: string,
        excludeId?: number
    ): Promise<void> {
        const existingSlots =
            await this.openingHoursRepository.getByRestaurantIdAndDay(
                restaurantId,
                dayOfWeek
            );

        for (const slot of existingSlots) {
            if (excludeId && slot.opening_hours_id === excludeId) {
                continue;
            }

            if (
                timesOverlap(
                    openTime,
                    closeTime,
                    slot.open_time,
                    slot.close_time
                )
            ) {
                throw new ConflictError(
                    `Time slot overlaps with existing slot (${slot.open_time} - ${slot.close_time})`
                );
            }
        }
    }
}
