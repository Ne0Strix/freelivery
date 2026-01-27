import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
    selector: 'app-order-tracking',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatChipsModule,
        MatIconModule,
    ],
    templateUrl: './order-tracking.component.html',
    styleUrls: ['./order-tracking.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTrackingComponent implements OnInit {
    orderId: string = '';
    currentStatus: string = 'preparing';
    deliveryTime: number = 30;

    sampleItems = [
        { dishId: 1, name: 'Pasta al pomodoro', price: 10.5, quantity: 1 },
        { dishId: 2, name: 'Pizza Margherita', price: 8.5, quantity: 1 },
        { dishId: 3, name: 'Sparkling Water', price: 1.5, quantity: 2 },
    ];

    get totalPrice(): number {
        return this.sampleItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    }

    statusOrder = ['placed', 'preparing', 'ready', 'delivered'];

    constructor(
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit(): void {
        this.orderId = this.route.snapshot.paramMap.get('id') || '1234';
        const randomStatus = Math.floor(Math.random() * 3) + 1;
        this.currentStatus = this.statusOrder[randomStatus];
        this.updateDeliveryTime();
    }

    currentStep(stepNumber: number): boolean {
        const currentStep = this.statusOrder.indexOf(this.currentStatus) + 1;
        return stepNumber <= currentStep;
    }

    refreshStatus(): void {
        const nextStep = Math.min(
            this.statusOrder.indexOf(this.currentStatus) + 1,
            this.statusOrder.length - 1
        );
        this.currentStatus = this.statusOrder[nextStep];
        this.updateDeliveryTime();

        this.snackBar.open('Order status updated!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
        });
    }

    updateDeliveryTime(): void {
        const userCoor = { x: 5, y: 5 };
        const restaurantCoor = { x: 3, y: 4 };

        const distance =
            Math.abs(userCoor.x - restaurantCoor.x) +
            Math.abs(userCoor.y - restaurantCoor.y);

        let baseTime = 15;
        if (distance <= 4) baseTime = 15;
        else if (distance <= 8) baseTime = 35;
        else baseTime = 55;

        if (this.currentStatus === 'placed') {
            this.deliveryTime = baseTime + 25;
        } else if (this.currentStatus === 'preparing') {
            this.deliveryTime = baseTime + 10;
        } else if (this.currentStatus === 'ready') {
            this.deliveryTime = baseTime;
        } else {
            this.deliveryTime = 0;
        }
    }

    goToFeedback(): void {
        alert('Redirecting to feedback page');
    }
}
