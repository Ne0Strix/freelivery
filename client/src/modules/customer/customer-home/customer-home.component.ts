import { Component, inject, OnInit, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Restaurant } from '../customer.model';
import { CustomerService } from '../customer.service';

@Component({
    selector: 'app-customer-home.component',
    imports: [MatProgressSpinnerModule],
    templateUrl: './customer-home.component.html',
    styleUrl: './customer-home.component.css',
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
        const restaurants = await this.customerService.getRestaurants();
        this.restaurants.set(restaurants);
        this.filteredRestaurants.set(restaurants);
        this.loading.set(false);
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

    onCuisineChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.selectedCuisine.set(select.value);
        this.filterRestaurants();
    }

    getCuisineTypes(): string[] {
        const cuisines = new Set(this.restaurants().map((r) => r.cuisineType));
        return Array.from(cuisines);
    }
}
