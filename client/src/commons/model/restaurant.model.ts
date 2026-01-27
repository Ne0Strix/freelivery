import { CreateAddress } from '../services/address.service';

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

export interface CreateRestaurant {
    name: string;
    description?: string;
    cuisineType: CuisineType;
    contactEmail: string;
    contactPhone: string;
    address: CreateAddress;
}

export interface CustomerSignup {
    phoneNumber: string;
    address: CreateAddress;
}

export interface OwnerRestaurant {
    restaurantId: number;
    name: string;
    description: string;
    cuisineType: CuisineType;
    contactEmail: string;
    contactPhone: string;
    status: string;
    maxDeliveryDistance: number;
    minOrderAmount: number;
}

export interface UpdateRestaurant {
    name?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    maxDeliveryDistance?: number;
    minOrderAmount?: number;
}

export interface RestaurantOwnerSignup {
    restaurant: CreateRestaurant;
}

/** DTOs related to the menu */

export interface Category {
    categoryId: number;
    restaurantId: number;
    name: string;
    description: string | null;
}

export interface Dish {
    dishId: number;
    restaurantId: number;
    categoryId: number;
    categoryName: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
}
