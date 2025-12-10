import { Address } from '../location/address.service.js';
import { User } from '../user/user.service.js';

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
