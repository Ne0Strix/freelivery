export interface Dish {
    dishId: number;
    restaurantId: number;
    category: Category;
    name: string;
    description: string;
    price: number;
    isAvailable: boolean;
}

export interface Category {
    categoryId: number;
    restaurantId: number;
    name: string;
    description: string;
}
