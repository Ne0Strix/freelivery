import { CurrencyPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import {
    RestaurantAnalytics,
    RestaurantOwnerService,
} from '../restaurant-owner.service';

@Component({
    selector: 'app-analytics',
    imports: [
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatTableModule,
        CurrencyPipe,
    ],
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements OnInit {
    private service = inject(RestaurantOwnerService);

    analytics = signal<RestaurantAnalytics | null>(null);
    loading = signal(true);

    // Table columns
    dailyColumns = ['date', 'orderCount', 'revenue'];
    topDishColumns = ['rank', 'dishName', 'totalQuantity', 'orderCount'];

    ngOnInit(): void {
        this.loadAnalytics();
    }

    private async loadAnalytics(): Promise<void> {
        this.loading.set(true);
        try {
            const data = await this.service.getAnalytics();
            this.analytics.set(data);
        } finally {
            this.loading.set(false);
        }
    }

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString(navigator.language, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    }
}
