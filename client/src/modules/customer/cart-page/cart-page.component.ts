import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PaymentMethodComponent } from '../payment-method/payment-method.component';
import { CartItem, CartService } from './cart.service';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-cart-page',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        RouterLink,
        PaymentMethodComponent,
    ],
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
    selectedPaymentMethod: string = 'card';
    restaurantId?: number;
    restaurantName?: string;

    constructor(
        private cartService: CartService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadCartData();
        this.updateTotal();
    }

    loadCartData(): void {
        const cartData = this.cartService.getCartData();
        this.itemsInCart = cartData.items;
        this.restaurantId = cartData.restaurantId;
        this.restaurantName = cartData.restaurantName;
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
            this.cartService.saveCartToLocal(
                this.itemsInCart,
                this.restaurantId,
                this.restaurantName
            );
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
            this.cartService.clearCart();
            this.promoApplied = false;
            this.discountValue = 0;
            this.restaurantId = undefined;
            this.restaurantName = undefined;
            this.updateTotal();
        }
    }

    onPaymentMethodChange(method: string): void {
        this.selectedPaymentMethod = method;
    }

    async confirmOrder(): Promise<void> {
        if (this.itemsInCart.length === 0) {
            this.errorMessage = 'Cart is empty!';
            return;
        }

        if (!this.restaurantId) {
            this.errorMessage = 'Restaurant information is not given';
            return;
        }

        if (!this.selectedPaymentMethod) {
            this.errorMessage = 'Please select a payment method';
            return;
        }

        this.isProcessingOrder = true;
        this.errorMessage = '';

        try {
            const result = await this.cartService.submitOrderToServer(
                this.restaurantId,
                this.itemsInCart,
                this.promoApplied ? 'PROMO26' : undefined,
                this.selectedPaymentMethod
            );

            this.cartService.clearCart();

            alert(`Order #${result.order_number} is placed!`);

            this.router.navigate(['/customer/tracking' + result.order_number]);
        } catch (error) {
            console.error('Order unsuccessful: ', error);
            this.errorMessage = 'Order failed. Place a new order, please!';
        } finally {
            this.isProcessingOrder = false;
        }
    }

    goToRestaurant(): void {
        this.router.navigate(['/customer/restaurants']);
    }
}
