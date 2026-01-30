import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderType: 'customer' | 'restaurant';
    message: string;
    timestamp: Date;
    orderId: string;
}

export interface OrderStatusUpdate {
    orderId: string;
    status: string;
    timestamp: Date;
    estimatedDeliveryTime: number;
}

export interface Location {
    x: number;
    y: number;
}

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private socket: WebSocket | null = null;
    private messagesSubject = new Subject<ChatMessage>();
    private connectionStatusSubject = new BehaviorSubject<boolean>(false);
    private statusUpdatesSubject = new Subject<OrderStatusUpdate>();

    public messages$ = this.messagesSubject.asObservable();
    public statusUpdates$ = this.statusUpdatesSubject.asObservable();
    public connectionStatus$ = this.connectionStatusSubject.asObservable();

    private wsUrl = 'ws://localhost:8080/orders';

    constructor() {}

    connect(orderId: string, userId: string): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            console.log('Websocket is already connected');
            return;
        }

        this.simulateWebsocketConnection(orderId, userId);
    }

    private connectRealWebSocket(orderId: string, userId: string): void {
        this.socket = new WebSocket(
            `${this.wsUrl}?orderId=${orderId}&userId=${userId}`
        );

        this.socket.onopen = () => {
            console.log('Websocket connected');
            this.connectionStatusSubject.next(true);
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'message_caht') {
                this.messagesSubject.next(data.payload as ChatMessage);
            } else if (data.type === 'update_status') {
                this.statusUpdatesSubject.next(
                    data.payload as OrderStatusUpdate
                );
            }
        };

        this.socket.onerror = (error) => {
            console.error('Websocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('Websocket disconnected');
            this.connectionStatusSubject.next(false);
        };
    }

    sendMessage(message: ChatMessage): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(
                JSON.stringify({
                    type: 'message_chat',
                    payload: message,
                })
            );
        } else {
            console.log('Sending message:', message);

            setTimeout(() => {
                this.messagesSubject.next(message);
            }, 100);
        }
    }

    requestStatusUpdate(orderId: string): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(
                JSON.stringify({
                    type: 'request_status',
                    orderId: orderId,
                })
            );
        } else {
            console.log('Status update request for current order:', orderId);
        }
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.connectionStatusSubject.next(false);
        }
    }

    calculateDistance(dist1: Location, dist2: Location): number {
        return Math.abs(dist1.x - dist2.x) + Math.abs(dist1.y - dist2.y);
    }

    calculateDeliveryTime(
        status: string,
        userLocation: Location,
        restaurantLocation: Location
    ): number {
        const distance = this.calculateDistance(
            userLocation,
            restaurantLocation
        );

        let base = 15;
        if (distance <= 3) {
            base = 20;
        } else if (distance <= 6) {
            base = 35;
        } else {
            base = 50;
        }

        switch (status) {
            case 'placed':
                return base + 25;
            case 'accepted':
                return base + 20;
            case 'preparing':
                return base + 10;
            case 'ready':
                return base;
            case 'delivered':
                return 0;
            default:
                return base;
        }
    }

    private simulateWebsocketConnection(orderId: string, userId: string): void {
        setTimeout(() => {
            this.connectionStatusSubject.next(true);
            console.log(
                'Websocket simulation started for order:',
                orderId,
                ' and user:',
                userId
            );
        }, 500);
    }

    simulateStatusUpdates(
        orderId: string,
        userLocation: Location,
        restaurantLocation: Location
    ): void {
        const statusOrder = [
            'placed',
            'accepted',
            'preparing',
            'ready',
            'delivered',
        ];

        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex < statusOrder.length) {
                const status = statusOrder[currentIndex];
                const update: OrderStatusUpdate = {
                    orderId: orderId,
                    status: status,
                    timestamp: new Date(),
                    estimatedDeliveryTime: this.calculateDeliveryTime(
                        status,
                        userLocation,
                        restaurantLocation
                    ),
                };

                this.statusUpdatesSubject.next(update);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 15000);
    }

    simulateRestaurantResponse(orderId: string): void {
        const restaurantResponse = [
            {
                delay: 6000,
                text: 'Dear Customer! Your order has been received and is waiting for confirmation.',
            },
            {
                delay: 18000,
                text: ' Your order has been confirmed and we are currently working on it.',
            },

            {
                delay: 30000,
                text: 'Your order is almost ready! Our delivery driver will pick it up soon!!',
            },
            {
                delay: 50000,
                text: 'Your order is done. The delivery driver will bring it to you shortly!',
            },
        ];

        restaurantResponse.forEach((msg) => {
            setTimeout(() => {
                const message: ChatMessage = {
                    id: this.generateId(),
                    senderId: 'restaurant_name',
                    senderName: 'Restaurant staff',
                    senderType: 'restaurant',
                    message: msg.text,
                    timestamp: new Date(),
                    orderId: orderId,
                };
                this.messagesSubject.next(message);
            }, msg.delay);
        });
    }

    private generateId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
