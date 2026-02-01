import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ChatMessage, Location, WebSocketService } from '../websocket.service';

interface OrderItem {
    dishId: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

interface OrderData {
    orderNumber: number;
    restaurantId: number;
    items: OrderItem[];
    deliveryFee?: number;
    PaymentMethod?: string;
    orderDate: string;
    status: string;
    restaurantLocation?: Location;
    total?: number;
}
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
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    templateUrl: './order-tracking.component.html',
    styleUrls: ['./order-tracking.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
    orderId: string = '';
    userId: string = 'customer_1';
    currentStatus: string = 'preparing';
    deliveryTime: number = 30;
    userLocation: Location = { x: 5, y: 3 };
    restaurantLocation: Location = { x: 6, y: 7 };
    orderItems: OrderItem[] = [];
    orderData: OrderData | null = null;

    chatMessages: ChatMessage[] = [];
    newMessage: string = '';
    isConnected: boolean = false;
    showChat: boolean = false;

    private lastPopupMessage: string = '';
    private showPopupMessages = new Set();

    statusOrder = [
        'placed',
        'accepted',
        'preparing',
        'ready',
        'delivering',
        'delivered',
    ];
    private destroy$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        public wsService: WebSocketService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.orderId = this.route.snapshot.paramMap.get('id') || '1234';
        console.log('Order ID from route:', this.orderId);

        this.getUserLocation();
        this.loadOrderData();
        this.initializeWebSocket();
    }

    private getUserLocation(): void {
        const userData = JSON.parse(
            localStorage.getItem('currentUser') || '{}'
        );

        if (userData.location) {
            this.userLocation = userData.location;
        } else {
            this.userLocation = { x: 5, y: 3 };
        }
    }

    private loadOrderData(): void {
        const orderDataS = localStorage.getItem(`order_${this.orderId}`);

        if (!orderDataS) {
            this.snackBar.open(
                'Order details not found. Please place an order first.',
                'Close',
                { duration: 3000 }
            );

            return;
        }

        try {
            this.orderData = JSON.parse(orderDataS);
            this.orderItems = this.orderData?.items || [];
            this.currentStatus = this.orderData?.status || 'placed';

            if (this.orderData?.restaurantLocation) {
                this.restaurantLocation = this.orderData.restaurantLocation;
            } else {
                this.restaurantLocation = { x: 6, y: 7 };
            }
        } catch (error) {
            console.error('Invalid order data:', error);
            this.snackBar.open('Failed to load order details', 'Close', {
                duration: 3000,
            });
        }
    }

    private initializeWebSocket(): void {
        this.wsService.connect(this.orderId, this.userId);

        this.wsService.connectionStatus$
            .pipe(takeUntil(this.destroy$))
            .subscribe((status) => {
                this.isConnected = status;
                this.cdr.markForCheck();
            });

        this.wsService.messages$
            .pipe(takeUntil(this.destroy$))
            .subscribe((message: any) => {
                console.log('Messages received:', message);
                this.chatMessages = [...this.chatMessages, message].sort(
                    (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime()
                );
                this.cdr.markForCheck();

                setTimeout(() => this.scroll(), 50);

                const messageKey = `${message.id}`;
                if (
                    message.senderType === 'restaurant' &&
                    message.showPopup == true &&
                    !this.showPopupMessages.has(messageKey)
                ) {
                    this.showPopupMessages.add(messageKey);

                    this.snackBar.open(
                        `${message.senderName}: ${message.message}`,
                        'Close',
                        {
                            duration: 5000,
                            verticalPosition: 'top',
                            horizontalPosition: 'right',
                            panelClass: ['custom-snackbar'],
                        }
                    );
                }
            });

        this.wsService.statusUpdates$
            .pipe(takeUntil(this.destroy$))
            .subscribe((update) => {
                console.log('Status update:', update);
                this.currentStatus = update.status;
                this.deliveryTime = update.estimatedDeliveryTime;

                if (this.orderData) {
                    this.orderData.status = update.status;
                    localStorage.setItem(
                        `order_${this.orderId}`,
                        JSON.stringify(this.orderData)
                    );
                }
                this.cdr.markForCheck();

                const statuses = [
                    'accepted',
                    'preparing',
                    'ready',
                    'delivered',
                ];
                if (statuses.includes(update.status)) {
                    this.snackBar.open(
                        `Order status updated: ${update.status}`,
                        'Close',
                        {
                            duration: 3000,
                            verticalPosition: 'top',
                            horizontalPosition: 'right',
                        }
                    );
                }
            });

        this.wsService.simulateStatusUpdates(
            this.orderId,
            this.userLocation,
            this.restaurantLocation
        );

        this.wsService.simulateRestaurantResponse(this.orderId);

        this.updateDeliveryTime();
    }

    private scroll(): void {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.wsService.disconnect();
    }

    get itemsSubtotal(): number {
        return this.orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    }

    get totalPrice(): number {
        const subtotal = this.itemsSubtotal;
        const deliveryFee = this.orderData?.deliveryFee || 0;
        return subtotal + deliveryFee;
    }

    currentStep(stepNumber: number): boolean {
        let currentIndex = this.statusOrder.indexOf(this.currentStatus);

        if (this.currentStatus === 'delivered' && currentIndex === -1) {
            currentIndex = this.statusOrder.indexOf('delivered');
        }

        if (currentIndex === -1) {
            currentIndex = 0;
        }
        return stepNumber <= currentIndex + 1;
    }

    refreshStatus(): void {
        this.wsService.requestStatusUpdate(this.orderId);
    }

    updateDeliveryTime(): void {
        this.deliveryTime = this.wsService.calculateDeliveryTime(
            this.currentStatus,
            this.userLocation,
            this.restaurantLocation
        );
    }

    toggleChat(): void {
        this.showChat = !this.showChat;
        if (this.showChat) {
            setTimeout(() => this.scroll(), 100);
        }
    }

    sendMessage(): void {
        if (!this.newMessage.trim()) {
            return;
        }

        const message: ChatMessage = {
            id: this.generateMessageId(),
            senderId: this.userId,
            senderName: 'You',
            senderType: 'customer',
            message: this.newMessage,
            timestamp: new Date(),
            orderId: this.orderId,
        };

        this.wsService.sendMessage(message);
        this.newMessage = '';
    }

    goToFeedback(): void {
        alert('Redirecting to feedback page');
    }

    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getStatusLabel(status: string): string {
        const statusLabel: { [key: string]: string } = {
            placed: 'Order placed',
            accepted: 'Order accepted',
            preparing: 'Preparing order',
            ready: 'Order is ready',
            delivering: 'Order is being delivered',
            delivered: 'Order delivered',
        };
        return statusLabel[status] || status;
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'placed':
                return 'fa-receipt';
            case 'accepted':
                return 'fa-check';
            case 'preparing':
                return 'fa-kitchen-set';
            case 'ready':
                return 'fa-box';
            case 'delivering':
                return 'fa-motorcycle';
            case 'delivered':
                return 'fa-house';
            default:
                return 'fa-circle';
        }
    }

    getDeliveryFee(): number {
        return this.orderData?.deliveryFee || 0;
    }

    hasDeliveryFee(): boolean {
        return !!this.orderData?.deliveryFee && this.orderData.deliveryFee > 0;
    }
}
