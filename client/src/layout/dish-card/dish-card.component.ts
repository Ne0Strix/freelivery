import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface DishCardData {
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isAvailable: boolean;
}

@Component({
    selector: 'app-dish-card',
    imports: [CurrencyPipe],
    templateUrl: './dish-card.component.html',
    styleUrl: './dish-card.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishCardComponent {
    @Input({ required: true }) dish!: DishCardData;

    readonly placeholderImage =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e0e0e0" width="100" height="100"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="%239e9e9e" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
}
