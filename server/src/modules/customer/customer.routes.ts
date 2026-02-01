import express, { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/async-handler.js';
import { CustomerService } from './customer.service.js';

const router = express.Router();
const service = new CustomerService();

const carts: Map<string, any[]> = new Map();

const getUserId = (req: Request): string => {
    return (req as any).user?.sub || 'user_1';
};

// GET api/cart/count-> get item count
router.get(
    '/cart/count',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const userCart = carts.get(userId) || [];
        const count = userCart.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
        );

        console.log('Cart count for user:', userId, 'Count:', count);

        return res.json({
            status: 'ok',
            data: { count },
        });
    })
);

// GET api/cart-> get cart for user
router.get(
    '/cart',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const userCart = carts.get(userId) || [];

        console.log('Cart GET for user:', userId, 'Items:', userCart.length);
        return res.json({
            status: 'ok',
            data: userCart,
        });
    })
);

// POST api/cart -> add items to cart
router.post(
    '/cart',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const { dishId, name, price, quantity = 1, restaurantId } = req.body;

        console.log('Cart POST received:', req.body);

        if (!dishId || !name || price === undefined || !restaurantId) {
            throw new Error('Required fields are missing');
        }

        const userCart = carts.get(userId) || [];

        const indexExist = userCart.findIndex(
            (item) =>
                item.dishId === dishId && item.restaurantId === restaurantId
        );

        if (indexExist >= 0) {
            userCart[indexExist].quantity += quantity;
            console.log(
                'Existing item quantity is updated:',
                userCart[indexExist]
            );
        } else {
            const cartItem = {
                cartItemId: Date.now(),
                dishId,
                name,
                price: parseFloat(price),
                quantity,
                restaurantId,
                addedAt: new Date().toISOString(),
            };
            userCart.push(cartItem);
            console.log('New item was added:', cartItem);
        }

        carts.set(userId, userCart);

        return res.status(201).json({
            status: 'ok',
            data: {
                message: 'New item added to cart',
                cart: userCart,
            },
        });
    })
);

//PUT /api/cart/itemID-> update item quantity
router.put(
    '/cart/:itemId',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const itemId = Number(req.params.itemId);
        const { quantity } = req.body;

        if (!itemId || itemId <= 0) {
            throw new Error('Invalid item Id');
        }

        if (quantity === undefined || quantity < 0) {
            throw new Error('Invalid quantity');
        }

        const userCart = carts.get(userId) || [];
        const itemIndex = userCart.findIndex(
            (item) => item.cartItemId === itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                status: 'error',
                error: 'Cart item not found',
            });
        }

        if (quantity === 0) {
            userCart.splice(itemIndex, 1);
            console.log('Item removed fromc cart:', itemId);
        } else {
            userCart[itemIndex].quantity = quantity;
            console.log('Updated item quantity', itemId, 'to', quantity);
        }

        carts.set(userId, userCart);

        return res.json({
            status: 'ok',
            data: {
                message: 'Cart updated',
                cart: userCart,
            },
        });
    })
);

// DELETE /api/cart/itemId -> remove item from cart
router.delete(
    '/cart/:itemId',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = getUserId(req);
        const itemId = Number(req.params.itemId);

        if (!itemId || itemId <= 0) {
            throw new Error('Invalid item ID');
        }

        let userCart = carts.get(userId) || [];
        const initial = userCart.length;

        userCart = userCart.filter((item) => item.cartItemId !== itemId);

        if (userCart.length === initial) {
            return res.status(404).json({
                status: 'error',
                error: 'Cart item not found',
            });
        }

        carts.set(userId, userCart);
        console.log('Item removed from cart:', itemId);

        return res.json({
            status: 'ok',
            data: {
                message: 'Item removed from cart',
                cart: userCart,
            },
        });
    })
);

// DELETE /api/cart -> clear cart
router.delete(
    '/cart',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = getUserId(req);

        carts.delete(userId);
        console.log('Cart cleared for user:', userId);

        return res.json({
            status: 'ok',
            data: {
                message: 'Cart cleared',
            },
        });
    })
);

router.get(
    '/restaurants/:restaurantId/menu',
    asyncHandler(async (req: Request, res: Response) => {
        const restaurantId = Number(req.params.restaurantId);
        const menuItems = await service.getMenuItemsByRestaurant(restaurantId);
        return res.json({ status: 'ok', data: menuItems });
    })
);

export default router;
