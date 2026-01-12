export interface Restaurant {
    restaurantId: number;
    name: string;
    cuisineType: string;
    address: string;
    rating: number;
    deliveryTime: string;
    isOpen: boolean;
}

export interface MenuItem {
    dishId: number;
    name: string;
    description: string;
    price: number;
    category: string;
    photo?: string;
}

export interface CartItem {
    dishId: number;
    name: string;
    price: number;
    quantity: number;
}
