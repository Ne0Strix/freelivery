import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '../../modules/restaurant-owner/restaurant-owner.service';

// Mapping of order statuses to their human-readable labels
const STATUS_LABELS: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'Pending',
    [OrderStatus.CONFIRMED]: 'Confirmed',
    [OrderStatus.PREPARING]: 'Preparing',
    [OrderStatus.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [OrderStatus.DELIVERED]: 'Delivered',
    [OrderStatus.CANCELLED]: 'Cancelled',
};

@Pipe({
    name: 'orderStatusLabel',
    standalone: true,
})
export class OrderStatusLabelPipe implements PipeTransform {
    transform(status: OrderStatus | null | undefined): string {
        if (!status) {
            return '';
        }
        return STATUS_LABELS[status] || status;
    }
}
