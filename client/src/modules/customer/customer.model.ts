export interface Restaurant {
    restaurantId: number;
    name: string;
    cuisineType: string;
    address: string;
    rating: number;
    status: string;
    deliveryTime: string;
    isOpen: boolean;
    description?: string;
    imageUrl?: string;
    serviceFee?: number;
    minOrderAmount?: number;
}

export interface MenuCategory {
    categoryId: number;
    restaurantId: number;
    name: string;
    description?: string;
}

export interface MenuItem {
    dishId: number;
    name: string;
    description: string;
    price: number;
    category: string;
    photo?: string;
    imageUrl?: string;
    isAvailable?: boolean;
    restaurantId?: number;
}

export interface CartItem {
    dishId: number;
    name: string;
    price: number;
    quantity: number;
    restaurant?: number;
}
