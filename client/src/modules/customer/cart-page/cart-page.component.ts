import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartItem, CartService } from './cart.service';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    ],
    templateUrl: './cart-page.component.html',
    styleUrls: ['./cart-page.component.css'],
})
export class CartPageComponent implements OnInit {
    private cartService = inject(CartService);
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);

    cartItems = signal<CartItem[]>([]);
    currentRestaurant = signal<{ id: number; name: string } | null>(null);
    loading = signal<boolean>(false);

    subtotal = signal<number>(0);
    deliveryFee = signal<number>(2.5);
    total = signal<number>(0);

    promoInput = '';
    promoApplied = false;
    discountValue = 0;
    errorMessage = '';

    ngOnInit(): void {
        this.loadCartData();
    }

    loadCartData(): void {
        try {
            const items = this.cartService.getCart();
            const restaurant = this.cartService.getCurrentRestaurant();

            this.cartItems.set(items);
            this.currentRestaurant.set(restaurant);

            this.calculateTotal();
        } catch (error) {
            console.error('Error loading cart:', error);
            this.snackBar.open('Error loading cart', 'Close', {
                duration: 3000,
            });
        }
    }

    calculateTotal(): void {
        const subTotal = this.cartService.getSubtotal();
        this.subtotal.set(subTotal);

        let total = this.cartService.getTotal(this.deliveryFee());

        if (this.promoApplied) {
            total -= this.discountValue;
        }
        this.total.set(total);
    }

    changeQuantity(index: number, change: number): void {
        const items = this.cartItems();
        const item = items[index];
        if (!item) return;

        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {
            return;
        }

        try {
            this.cartService.changeQuantity(item.dishId, newQuantity);
            this.loadCartData();
            this.snackBar.open('Cart updated', 'Close', { duration: 1500 });
        } catch (error) {
            console.error('Error updating quantity', error);
            this.snackBar.open('Error updating cart', 'Close', {
                duration: 3000,
            });
        }
    }

    removeItem(dishId: number): void {
        try {
            this.cartService.removeFromCart(dishId);
            this.loadCartData();
            this.snackBar.open('Item removed from cart', 'Close', {
                duration: 2500,
            });
        } catch (error) {
            console.error('Error removing item:', error);
            this.snackBar.open('Error removing item', 'Close', {
                duration: 2500,
            });
        }
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
            this.calculateTotal();
        } else {
            this.errorMessage = 'Invalid promo code.';
            this.promoApplied = false;
            this.discountValue = 0;
            this.calculateTotal();
        }
    }

    clearCart(): void {
        const confirmClear = confirm(
            'Are you sure you want to clear your cart?'
        );

        if (confirmClear) {
            try {
                this.cartService.clearCart();
                this.loadCartData();
                this.snackBar.open('Cart cleared', 'Close', { duration: 2500 });
            } catch (error) {
                console.error('Error clearing item:', error);
                this.snackBar.open('Error clearing item', 'Close', {
                    duration: 2500,
                });
            }
        }
    }

    proceedToCheckout(): void {
        const validation = this.cartService.isCartValid();

        if (!validation.valid) {
            this.snackBar.open(validation.errors.join(', '), 'Close', {
                duration: 2500,
            });
            return;
        }

        const checkoutData = {
            items: this.cartItems(),
            restaurant: this.currentRestaurant(),
            subtotal: this.subtotal(),
            deliveryFee: this.deliveryFee(),
            discount: this.discountValue,
            total: this.total(),
            promoApplied: this.promoApplied,
        };

        localStorage.setItem('checkout_data', JSON.stringify(checkoutData));
        this.router.navigate(['/customer/checkout']);
    }

    getItemTotal(item: CartItem): number {
        return item.price * item.quantity;
    }

    get itemsInCart(): CartItem[] {
        return this.cartItems();
    }

    get restaurantName(): string | undefined {
        return this.currentRestaurant()?.name;
    }

    get totalPrice(): number {
        return this.total();
    }
}
