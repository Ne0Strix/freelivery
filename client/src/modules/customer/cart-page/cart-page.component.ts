import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItem, CartService } from './cart.service';

@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './cart-page.component.html',
    styleUrls: ['./cart-page.component.css'],
})
export class CartPageComponent implements OnInit {
    itemsInCart: CartItem[] = [];
    subtotal: number = 0;
    totalPrice: number = 0;
    promoInput: string = '';
    promoApplied: boolean = false;
    discountValue: number = 0;
    isProcessingOrder: boolean = false;
    errorMessage: string = '';

    constructor(
        private cartService: CartService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadCartData();
        this.updateTotal();
    }

    loadCartData(): void {
        this.itemsInCart = this.cartService.getCustomerCart();
    }

    addItems(): void {
        const sampleItems: CartItem[] = [
            { dishId: 1, name: 'Pasta al pomodoro', price: 10.5, quantity: 1 },
            { dishId: 2, name: 'Pizza Margherita', price: 8.5, quantity: 1 },
            { dishId: 3, name: 'Sparkling Water', price: 1.5, quantity: 2 },
        ];
        this.itemsInCart = sampleItems;
        this.cartService.saveCartToLocal(sampleItems);
        this.updateTotal();
    }

    updateTotal(): void {
        this.subtotal = this.itemsInCart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        this.totalPrice = Math.max(this.subtotal - this.discountValue, 0);
    }

    changeQuantity(itemIndex: number, change: number): void {
        const item = this.itemsInCart[itemIndex];
        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {
            this.cartService.removeFromCart(item.dishId);
            this.itemsInCart.splice(itemIndex, 1);
        } else {
            item.quantity = newQuantity;
            this.cartService.saveCartToLocal(this.itemsInCart);
        }
        this.updateTotal();
    }

    removeItem(itemId: number): void {
        this.cartService.removeFromCart(itemId);
        this.itemsInCart = this.itemsInCart.filter(
            (item) => item.dishId !== itemId
        );
        this.updateTotal();
    }

    applyPromoCode(): void {
        if (!this.promoInput.trim()) {
            this.errorMessage = 'Enter a valid promo code';
            return;
        }

        if (this.promoInput.toUpperCase() === 'PROMO26') {
            this.discountValue = 5.0;
            this.promoApplied = true;
            this.errorMessage = '';
            this.promoInput = '';
            this.updateTotal();
        } else {
            this.errorMessage = 'Invalid promo code.';
            this.promoApplied = false;
            this.discountValue = 0;
            this.updateTotal();
        }
    }

    clearCart(): void {
        if (confirm('Clear all items?')) {
            this.itemsInCart = [];
            localStorage.removeItem('user_cart_items');
            this.promoApplied = false;
            this.discountValue = 0;
            this.updateTotal();
        }
    }

    async confirmOrder(): Promise<void> {
        if (this.itemsInCart.length === 0) {
            this.errorMessage = ' Cart is empty!';
            return;
        }
        this.isProcessingOrder = true;
        this.errorMessage = '';

        try {
            const result = await this.cartService.sendOrderToServer(
                1,
                this.itemsInCart,
                this.promoApplied ? 'PROMO26' : undefined
            );

            alert(`Order #${result.order_number} is placed`);

            this.router.navigate(['/customer/track', result.order_number]);
        } catch (error) {
            console.error('Order unsuccessful: ', error);
            this.errorMessage = 'Order failed. Place a new order, please!';

            const notOrderId = Math.floor(Math.random() * 10000);
            alert(`Demo: Order #${notOrderId}`);
            this.router.navigate(['/customer/track', notOrderId]);
        } finally {
            this.isProcessingOrder = false;
        }
    }

    goToRestaurant(): void {
        this.router.navigate(['/customer']);
    }
}
