import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PaymentMethodComponent } from '../paymentt-method/paymentt-method.component';
import { CartService } from './../cart-page/cart.service';

interface CheckoutData {
    items: any[];
    restaurant: { id: number; name: string } | null;
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    total: number;
    promoApplied: boolean;
}

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        PaymentMethodComponent,
    ],
    templateUrl: './checkout-page.component.html',
    styleUrls: ['./checkout-page.component.css'],
})
export class CheckoutComponent implements OnInit {
    private router = inject(Router);
    private snackBar = inject(MatSnackBar);
    private cartService = inject(CartService);

    checkoutData = signal<CheckoutData | null>(null);
    selectedPaymentMethod = signal<string>('card');
    isProcessing = signal<boolean>(false);

    ngOnInit(): void {
        this.loadCheckoutData();
    }

    loadCheckoutData(): void {
        const dataS = localStorage.getItem('checkout_data');

        if (!dataS) {
            this.snackBar.open(
                'No checkout data found. Go back to cart page please',
                'Close',
                { duration: 2500 }
            );
            this.router.navigate(['/customer/cart']);
            return;
        }

        try {
            const data = JSON.parse(dataS) as CheckoutData;
            this.checkoutData.set(data);
        } catch (error) {
            console.error('Error fetching checkout data:', error);
            this.router.navigate(['/customer/cart']);
        }
    }

    onPaymentMethodChange(methodId: string): void {
        console.log('Payment method changed to:', methodId);
        this.selectedPaymentMethod.set(methodId);
    }

    async processPayment(): Promise<void> {
        const data = this.checkoutData();

        if (!data) {
            this.snackBar.open('No checkout data available', 'CLose', {
                duration: 2500,
            });
            return;
        }
        this.isProcessing.set(true);

        setTimeout(() => {
            const orderNumber = Math.floor(Math.random() * 700000) + 100000;

            console.log('Payment was successfull for order #' + orderNumber);
            const orderData = {
                orderNumber: orderNumber,
                restaurantId: data.restaurant?.id,
                restaurantName: data.restaurant?.name,
                items: data.items,
                subtotal: data.subtotal,
                deliveryFee: data.deliveryFee,
                serviceFee: data.serviceFee,
                discount: data.discount,
                total: data.total,
                paymentMethod: this.selectedPaymentMethod(),
                orderDate: new Date().toISOString(),
                status: 'placed',
                userLocation: { x: 5, y: 3 },
                restaurantLocation: { x: 6, y: 7 },
            };

            localStorage.setItem(
                `order_${orderNumber}`,
                JSON.stringify(orderData)
            );

            this.cartService.clearCart();
            console.log('Cart cleared');

            localStorage.removeItem('checkout_data');

            this.isProcessing.set(false);

            this.snackBar.open(
                'Payment successful! Redirecting you to order tracking!!',
                'Close',
                { duration: 2500 }
            );

            console.log(
                'Redirecting you to: /customer/tracking/' + orderNumber
            );

            setTimeout(() => {
                this.router.navigate(['/customer/tracking', orderNumber]);
            }, 1500);
        }, 2500);
    }

    goToCart(): void {
        this.router.navigate(['/customer/cart']);
    }
}
