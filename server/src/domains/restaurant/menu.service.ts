import fs from 'fs/promises';
import { ForbiddenError, NotFoundError } from '../commons/errors.js';
import {
    CategoryRepository,
    CategoryRow,
    DishRepository,
    DishRow,
    DishWithCategoryRow,
} from './menu.repository.js';
import {
    RestaurantRepository,
    RestaurantRow,
} from './restaurant.repository.js';

// =====================
// Category DTOs
// =====================

export interface Category {
    categoryId: number;
    restaurantId: number;
    name: string;
    description: string | null;
}

export interface CreateCategory {
    name: string;
    description?: string;
}

export interface UpdateCategory {
    name?: string;
    description?: string;
}

// =====================
// Dish DTOs
// =====================

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

export interface CreateDish {
    categoryId: number;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
}

export interface UpdateDish {
    categoryId?: number;
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
}

// =====================
// Row → DTO Transforms
// =====================

function categoryRowToDto(row: CategoryRow): Category {
    return {
        categoryId: row.category_id,
        restaurantId: row.restaurant_id,
        name: row.name,
        description: row.description,
    };
}

function dishRowToDto(row: DishWithCategoryRow): Dish {
    return {
        dishId: row.dish_id,
        restaurantId: row.restaurant_id,
        categoryId: row.category_id,
        categoryName: row.category_name,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        imageUrl: row.image_url,
        isAvailable: row.is_available,
    };
}

function simpleDishRowToDto(row: DishRow, categoryName: string = ''): Dish {
    return {
        dishId: row.dish_id,
        restaurantId: row.restaurant_id,
        categoryId: row.category_id,
        categoryName,
        name: row.name,
        description: row.description,
        price: Number(row.price),
        imageUrl: row.image_url,
        isAvailable: row.is_available,
    };
}

// =====================
// Menu Service
// =====================

export class MenuService {
    constructor(
        private categoryRepository: CategoryRepository,
        private dishRepository: DishRepository,
        private restaurantRepository: RestaurantRepository
    ) {}

    // =====================
    // Ownership Validation
    // =====================

    /** Get the owner's restaurant or throw if they don't have one */
    async getOwnerRestaurant(ownerUserId: number): Promise<RestaurantRow> {
        const allRestaurants = await this.restaurantRepository.getAll();
        const restaurant = allRestaurants.find(
            (r) => r.owner_user_id === ownerUserId
        );
        if (!restaurant) {
            throw new NotFoundError('No restaurant found for this owner');
        }
        return restaurant;
    }

    /** Verify the category belongs to the owner's restaurant */
    private async verifyCategoryOwnership(
        categoryId: number,
        ownerUserId: number
    ): Promise<{ category: CategoryRow; restaurant: RestaurantRow }> {
        const restaurant = await this.getOwnerRestaurant(ownerUserId);
        const category = await this.categoryRepository.getByIdOrThrow(
            categoryId,
            {
                message: 'Category not found',
            }
        );

        if (category.restaurant_id !== restaurant.restaurant_id) {
            throw new ForbiddenError(
                'Category does not belong to your restaurant'
            );
        }

        return { category, restaurant };
    }

    /** Verify the dish belongs to the owner's restaurant */
    private async verifyDishOwnership(
        dishId: number,
        ownerUserId: number
    ): Promise<{ dish: DishRow; restaurant: RestaurantRow }> {
        const restaurant = await this.getOwnerRestaurant(ownerUserId);
        const dish = await this.dishRepository.getByIdOrThrow(dishId, {
            message: 'Dish not found',
        });

        if (dish.restaurant_id !== restaurant.restaurant_id) {
            throw new ForbiddenError('Dish does not belong to your restaurant');
        }

        return { dish, restaurant };
    }

    // =====================
    // Public Read Operations (by restaurantId)
    // =====================

    /** Get all categories for a restaurant (public read) */
    async getCategoriesByRestaurant(restaurantId: number): Promise<Category[]> {
        // Verify restaurant exists
        await this.restaurantRepository.getByIdOrThrow(restaurantId, {
            message: 'Restaurant not found',
        });
        const rows =
            await this.categoryRepository.getByRestaurantId(restaurantId);
        return rows.map(categoryRowToDto);
    }

    /** Get all dishes for a restaurant (public read) */
    async getDishesByRestaurant(restaurantId: number): Promise<Dish[]> {
        // Verify restaurant exists
        await this.restaurantRepository.getByIdOrThrow(restaurantId, {
            message: 'Restaurant not found',
        });
        const rows = await this.dishRepository.getByRestaurantId(restaurantId);
        return rows.map(dishRowToDto);
    }

    // =====================
    // Category Operations (Owner)
    // =====================

    async createCategory(
        ownerUserId: number,
        dto: CreateCategory
    ): Promise<Category> {
        const restaurant = await this.getOwnerRestaurant(ownerUserId);
        const row = await this.categoryRepository.create({
            restaurant_id: restaurant.restaurant_id,
            name: dto.name,
            description: dto.description ?? null,
        });
        return categoryRowToDto(row);
    }

    async updateCategory(
        ownerUserId: number,
        categoryId: number,
        dto: UpdateCategory
    ): Promise<Category> {
        await this.verifyCategoryOwnership(categoryId, ownerUserId);
        const row = await this.categoryRepository.update(categoryId, {
            name: dto.name,
            description: dto.description,
        });
        return categoryRowToDto(row);
    }

    async deleteCategory(
        ownerUserId: number,
        categoryId: number
    ): Promise<void> {
        await this.verifyCategoryOwnership(categoryId, ownerUserId);

        // Delete all dish images in this category first
        const dishes = await this.dishRepository.getByCategoryId(categoryId);
        for (const dish of dishes) {
            if (dish.image_url) {
                await this.deleteImageFile(dish.image_url);
            }
        }

        await this.categoryRepository.deleteById(categoryId);
    }

    // =====================
    // Dish Operations (Owner)
    // =====================

    async createDish(ownerUserId: number, dto: CreateDish): Promise<Dish> {
        const restaurant = await this.getOwnerRestaurant(ownerUserId);

        // Verify category belongs to this restaurant
        await this.verifyCategoryOwnership(dto.categoryId, ownerUserId);

        const row = await this.dishRepository.create({
            restaurant_id: restaurant.restaurant_id,
            category_id: dto.categoryId,
            name: dto.name,
            description: dto.description ?? null,
            price: String(dto.price),
            image_url: dto.imageUrl ?? null,
            is_available: true,
        });

        const category = await this.categoryRepository.getById(dto.categoryId);
        return simpleDishRowToDto(row, category?.name ?? '');
    }

    async updateDish(
        ownerUserId: number,
        dishId: number,
        dto: UpdateDish
    ): Promise<Dish> {
        const { dish } = await this.verifyDishOwnership(dishId, ownerUserId);

        // If changing category, verify it belongs to the same restaurant
        if (dto.categoryId !== undefined) {
            await this.verifyCategoryOwnership(dto.categoryId, ownerUserId);
        }

        // Delete old image if a new one is provided or image is being removed
        const isRemovingImage = dto.imageUrl === '';
        const isChangingImage =
            dto.imageUrl !== undefined &&
            dto.imageUrl !== '' &&
            dto.imageUrl !== dish.image_url;
        if ((isRemovingImage || isChangingImage) && dish.image_url) {
            await this.deleteImageFile(dish.image_url);
        }

        const updatedRow = await this.dishRepository.update(dishId, {
            category_id: dto.categoryId,
            name: dto.name,
            description: dto.description,
            price: dto.price !== undefined ? String(dto.price) : undefined,
            image_url: isRemovingImage ? null : dto.imageUrl,
        });

        const category = await this.categoryRepository.getById(
            updatedRow.category_id
        );
        return simpleDishRowToDto(updatedRow, category?.name ?? '');
    }

    async deleteDish(ownerUserId: number, dishId: number): Promise<void> {
        const { dish } = await this.verifyDishOwnership(dishId, ownerUserId);

        // Delete the image file
        if (dish.image_url) {
            await this.deleteImageFile(dish.image_url);
        }

        await this.dishRepository.deleteById(dishId);
    }

    async toggleDishAvailability(
        ownerUserId: number,
        dishId: number
    ): Promise<Dish> {
        const { dish } = await this.verifyDishOwnership(dishId, ownerUserId);
        const updatedRow = await this.dishRepository.updateAvailability(
            dishId,
            !dish.is_available
        );
        const category = await this.categoryRepository.getById(
            updatedRow.category_id
        );
        return simpleDishRowToDto(updatedRow, category?.name ?? '');
    }

    // =====================
    // Image Cleanup
    // =====================

    /** Delete an image file from the uploads directory */
    private async deleteImageFile(imageUrl: string): Promise<void> {
        try {
            // imageUrl is like /uploads/dishes/filename.jpg
            // We need to convert to local path: ./uploads/dishes/filename.jpg
            const localPath = '.' + imageUrl;
            await fs.unlink(localPath);
        } catch (err) {
            // Log but don't throw - image may already be deleted
            console.warn(`Failed to delete image file: ${imageUrl}`, err);
        }
    }
}
