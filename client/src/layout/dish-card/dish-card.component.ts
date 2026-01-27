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

    // Simple placeholder image service
    readonly placeholderImage =
        'https://placehold.co/400x300/e0e0e0/9e9e9e?text=No+Image';
}
