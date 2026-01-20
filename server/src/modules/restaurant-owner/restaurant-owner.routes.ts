import type { Request } from 'express';
import express, { Response } from 'express';
import { ValidationError } from '../../domains/commons/errors.js';
import { OrderStatus } from '../../domains/order/order.model.js';
import { OrderRepository } from '../../domains/order/order.repository.js';
import { OrderService } from '../../domains/order/order.service.js';
import {
    CategoryRepository,
    DishRepository,
} from '../../domains/restaurant/menu.repository.js';
import { MenuService } from '../../domains/restaurant/menu.service.js';
import { RestaurantRepository } from '../../domains/restaurant/restaurant.repository.js';
import { asyncHandler } from '../../middleware/async-handler.js';
import { getImageUrl, uploadDishPhoto } from '../../middleware/upload.js';

const router = express.Router();

const restaurantRepository = new RestaurantRepository();

const menuService = new MenuService(
    new CategoryRepository(),
    new DishRepository(),
    restaurantRepository
);

const orderService = new OrderService(
    new OrderRepository(),
    restaurantRepository
);

// Helper to get owner user id from authenticated request
function getOwnerUserId(req: Request): number {
    return (req as any).user.sub;
}

// Helper to get uploaded file from multer request
function getUploadedFile(req: Request): { filename: string } | undefined {
    return (req as any).file;
}

// =====================
// Restaurant Info
// =====================

/** GET /my-restaurant - Get the owner's restaurant info */
router.get(
    '/my-restaurant',
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const restaurant = await menuService.getOwnerRestaurant(ownerUserId);
        return res.json({
            status: 'ok',
            data: {
                restaurantId: restaurant.restaurant_id,
                name: restaurant.name,
                status: restaurant.status,
            },
        });
    })
);

// =====================
// Category Routes
// =====================

/** POST /menu/categories - Create a new category */
router.post(
    '/menu/categories',
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const { name, description } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new ValidationError('Name is required');
        }

        const category = await menuService.createCategory(ownerUserId, {
            name: name.trim(),
            description: description?.trim(),
        });
        return res.status(201).json({ status: 'ok', data: category });
    })
);

/** PUT /menu/categories/:id - Update a category */
router.put(
    '/menu/categories/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const categoryId = Number(req.params.id);
        const { name, description } = req.body;

        if (isNaN(categoryId)) {
            throw new ValidationError('Invalid category ID');
        }

        const category = await menuService.updateCategory(
            ownerUserId,
            categoryId,
            {
                name: name?.trim(),
                description: description?.trim(),
            }
        );
        return res.json({ status: 'ok', data: category });
    })
);

/** DELETE /menu/categories/:id - Delete a category */
router.delete(
    '/menu/categories/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const categoryId = Number(req.params.id);

        if (isNaN(categoryId)) {
            throw new ValidationError('Invalid category ID');
        }

        await menuService.deleteCategory(ownerUserId, categoryId);
        return res.json({
            status: 'ok',
            data: { message: 'Category deleted' },
        });
    })
);

// =====================
// Dish Routes
// =====================

/** POST /menu/dishes - Create a new dish (with optional photo upload) */
router.post(
    '/menu/dishes',
    uploadDishPhoto,
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const { categoryId, name, description, price } = req.body;

        if (!categoryId || isNaN(Number(categoryId))) {
            throw new ValidationError('Valid category ID is required');
        }
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new ValidationError('Name is required');
        }
        if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
            throw new ValidationError('Valid price is required');
        }

        // Get image URL if file was uploaded
        const uploadedFile = getUploadedFile(req);
        const imageUrl = uploadedFile
            ? getImageUrl(uploadedFile.filename)
            : undefined;

        const dish = await menuService.createDish(ownerUserId, {
            categoryId: Number(categoryId),
            name: name.trim(),
            description: description?.trim(),
            price: Number(price),
            imageUrl,
        });
        return res.status(201).json({ status: 'ok', data: dish });
    })
);

/** PUT /menu/dishes/:id - Update a dish (with optional photo upload) */
router.put(
    '/menu/dishes/:id',
    uploadDishPhoto,
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const dishId = Number(req.params.id);
        const { categoryId, name, description, price, removeImage } = req.body;

        if (isNaN(dishId)) {
            throw new ValidationError('Invalid dish ID');
        }

        // Build update object
        const updateData: {
            categoryId?: number;
            name?: string;
            description?: string;
            price?: number;
            imageUrl?: string;
        } = {};

        if (categoryId !== undefined) {
            if (isNaN(Number(categoryId))) {
                throw new ValidationError('Invalid category ID');
            }
            updateData.categoryId = Number(categoryId);
        }
        if (name !== undefined) {
            updateData.name = name.trim();
        }
        if (description !== undefined) {
            updateData.description = description.trim();
        }
        if (price !== undefined) {
            if (isNaN(Number(price)) || Number(price) < 0) {
                throw new ValidationError('Invalid price');
            }
            updateData.price = Number(price);
        }

        // Handle image: new upload, remove, or keep existing
        const uploadedFile = getUploadedFile(req);
        if (uploadedFile) {
            updateData.imageUrl = getImageUrl(uploadedFile.filename);
        } else if (removeImage === 'true' || removeImage === true) {
            updateData.imageUrl = ''; // Empty string signals removal
        }

        const dish = await menuService.updateDish(
            ownerUserId,
            dishId,
            updateData
        );
        return res.json({ status: 'ok', data: dish });
    })
);

/** DELETE /menu/dishes/:id - Delete a dish */
router.delete(
    '/menu/dishes/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const dishId = Number(req.params.id);

        if (isNaN(dishId)) {
            throw new ValidationError('Invalid dish ID');
        }

        await menuService.deleteDish(ownerUserId, dishId);
        return res.json({ status: 'ok', data: { message: 'Dish deleted' } });
    })
);

/** PATCH /menu/dishes/:id/availability - Toggle dish availability */
router.patch(
    '/menu/dishes/:id/availability',
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const dishId = Number(req.params.id);

        if (isNaN(dishId)) {
            throw new ValidationError('Invalid dish ID');
        }

        const dish = await menuService.toggleDishAvailability(
            ownerUserId,
            dishId
        );
        return res.json({ status: 'ok', data: dish });
    })
);

// =====================
// Order Routes
// =====================

/** GET /orders - Get all orders for the owner's restaurant */
router.get(
    '/orders',
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const orders = await orderService.getOrdersForOwner(ownerUserId);
        return res.json({ status: 'ok', data: orders });
    })
);

/** PATCH /orders/:id/status - Update order status */
router.patch(
    '/orders/:id/status',
    asyncHandler(async (req: Request, res: Response) => {
        const ownerUserId = getOwnerUserId(req);
        const orderId = Number(req.params.id);
        const { status } = req.body;

        if (isNaN(orderId)) {
            throw new ValidationError('Invalid order ID');
        }

        if (!status || typeof status !== 'string') {
            throw new ValidationError('Status is required');
        }

        // Validate status is a valid OrderStatus enum value
        if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
            throw new ValidationError(
                `Invalid status. Must be one of: ${Object.values(OrderStatus).join(', ')}`
            );
        }

        const order = await orderService.updateOrderStatus(
            ownerUserId,
            orderId,
            status as OrderStatus
        );
        return res.json({ status: 'ok', data: order });
    })
);

export default router;
