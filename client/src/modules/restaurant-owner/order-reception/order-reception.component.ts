import { CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    OnDestroy,
    OnInit,
    signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { OrderStatusLabelPipe } from '../../../commons/pipes/order-status-label.pipe';
import {
    OrderStatus,
    RestaurantOrder,
    RestaurantOwnerService,
} from '../restaurant-owner.service';

/** Order statuses in display order (active ones for restaurant management) */
const ACTIVE_STATUSES: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.OUT_FOR_DELIVERY,
];

/** Refresh interval in seconds */
const REFRESH_INTERVAL = 30;

@Component({
    selector: 'app-order-reception',
    imports: [
        LowerCasePipe,
        DatePipe,
        CurrencyPipe,
        MatExpansionModule,
        MatButtonModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        OrderStatusLabelPipe,
        RouterModule,
    ],
    templateUrl: './order-reception.component.html',
    styleUrl: './order-reception.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderReceptionComponent implements OnInit, OnDestroy {
    private ownerService = inject(RestaurantOwnerService);
    private snackBar = inject(MatSnackBar);
    private statusLabelPipe = new OrderStatusLabelPipe();

    // Expose enum to template
    readonly OrderStatus = OrderStatus;
    readonly activeStatuses = ACTIVE_STATUSES;

    // State
    loading = signal(true);
    orders = signal<RestaurantOrder[]>([]);
    countdown = signal(REFRESH_INTERVAL);
    updatingOrderId = signal<number | null>(null);

    // Timer reference
    private intervalId: ReturnType<typeof setInterval> | null = null;

    // Computed: group orders by status
    ordersByStatus = computed(() => {
        const allOrders = this.orders();
        const grouped = new Map<OrderStatus, RestaurantOrder[]>();

        // Initialize all status groups
        for (const status of ACTIVE_STATUSES) {
            grouped.set(status, []);
        }

        // Group orders
        for (const order of allOrders) {
            const statusOrders = grouped.get(order.status);
            if (statusOrders) {
                statusOrders.push(order);
            }
        }

        return grouped;
    });

    // Computed: count of actionable orders
    actionableCount = computed(() => {
        const byStatus = this.ordersByStatus();
        let count = 0;
        for (const status of ACTIVE_STATUSES) {
            count += byStatus.get(status)?.length || 0;
        }
        return count;
    });

    ngOnInit(): void {
        this.loadOrders();
        this.startCountdown();
    }

    ngOnDestroy(): void {
        this.stopCountdown();
    }

    async loadOrders(): Promise<void> {
        this.loading.set(true);
        try {
            const orders = await this.ownerService.getOrders();
            this.orders.set(orders);
        } catch (error) {
            console.error('Failed to load orders', error);
        } finally {
            this.loading.set(false);
            this.resetCountdown();
        }
    }

    async refreshOrders(): Promise<void> {
        try {
            const orders = await this.ownerService.getOrders();
            this.orders.set(orders);
        } catch (error) {
            console.error('Failed to refresh orders', error);
        }
        this.resetCountdown();
    }

    // =====================
    // Status Transitions
    // =====================

    async acceptOrder(order: RestaurantOrder): Promise<void> {
        await this.updateStatus(order, OrderStatus.CONFIRMED);
    }

    async rejectOrder(order: RestaurantOrder): Promise<void> {
        await this.updateStatus(order, OrderStatus.CANCELLED);
    }

    async startPreparing(order: RestaurantOrder): Promise<void> {
        await this.updateStatus(order, OrderStatus.PREPARING);
    }

    async markReady(order: RestaurantOrder): Promise<void> {
        await this.updateStatus(order, OrderStatus.OUT_FOR_DELIVERY);
    }

    async markDelivered(order: RestaurantOrder): Promise<void> {
        await this.updateStatus(order, OrderStatus.DELIVERED);
    }

    // =====================
    // Private Methods
    // =====================

    private async updateStatus(
        order: RestaurantOrder,
        newStatus: OrderStatus
    ): Promise<void> {
        this.updatingOrderId.set(order.orderId);
        try {
            await this.ownerService.updateOrderStatus(order.orderId, newStatus);
            this.snackBar.open(
                `Order #${order.orderId} updated to ${this.statusLabelPipe.transform(newStatus)}`,
                'Close',
                { duration: 3000 }
            );
            await this.refreshOrders();
        } catch (error) {
            console.error('Failed to update order status', error);
        } finally {
            this.updatingOrderId.set(null);
        }
    }

    private startCountdown(): void {
        this.intervalId = setInterval(() => {
            const current = this.countdown();
            if (current <= 1) {
                this.refreshOrders();
            } else {
                this.countdown.set(current - 1);
            }
        }, 1000);
    }

    private stopCountdown(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private resetCountdown(): void {
        this.countdown.set(REFRESH_INTERVAL);
    }
}
