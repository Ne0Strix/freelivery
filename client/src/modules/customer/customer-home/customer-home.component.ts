import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { RouterLink } from '@angular/router';
import { Restaurant } from '../customer.model';
import { CustomerService } from '../customer.service';

@Component({
    selector: 'app-customer-home',
    standalone: true,
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinner,
        MatIconModule,
    ],
    templateUrl: './customer-home.component.html',
    styleUrl: './customer-home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerHomeComponent implements OnInit {
    private customerService = inject(CustomerService);

    restaurants = signal<Restaurant[]>([]);
    filteredRestaurants = signal<Restaurant[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    selectedCuisine = signal<string>('all');

    ngOnInit(): void {
        this.loadRestaurants();
    }

    private async loadRestaurants(): Promise<void> {
        this.loading.set(true);
        try {
            const restaurants = await this.customerService.getRestaurants();
            this.restaurants.set(restaurants);
            this.filteredRestaurants.set(restaurants);
        } catch (error) {
            console.error('Failed to load restaurants', error);
        } finally {
            this.loading.set(false);
        }
    }

    filterRestaurants(): void {
        let filtered = this.restaurants();

        if (this.selectedCuisine() !== 'all') {
            filtered = filtered.filter(
                (r) => r.cuisineType == this.selectedCuisine()
            );
        }

        const search = this.searchTerm().toLowerCase();
        if (search) {
            filtered = filtered.filter((r) =>
                r.name.toLowerCase().includes(search)
            );
        }

        this.filteredRestaurants.set(filtered);
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchTerm.set(input.value);
        this.filterRestaurants();
    }

    onCuisineChange(event: MatSelectChange): void {
        this.selectedCuisine.set(event.value);
        this.filterRestaurants();
    }

    getCuisineTypes(): string[] {
        const cuisines = new Set(this.restaurants().map((r) => r.cuisineType));
        return Array.from(cuisines);
    }
}
