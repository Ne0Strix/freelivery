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
}

/** DTO for creating a new restaurant during signup */
export interface CreateRestaurant {
    name: string;
    description?: string;
    cuisineType: CuisineType;
    contactEmail: string;
    contactPhone: string;
    address: CreateAddress;
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
}

/** DTO for customer signup data */
export interface CustomerSignup {
    phoneNumber: string;
    address: CreateAddress;
}

/** DTO for restaurant owner signup data */
export interface RestaurantOwnerSignup {
    restaurant: CreateRestaurant;
}
