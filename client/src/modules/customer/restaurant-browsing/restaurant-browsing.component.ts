import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Restaurant } from '../customer.model';

import { CustomerService } from '../customer.service';
import { RestaurantBrowsingService } from './restaurant-browsing.service';

@Component({
    selector: 'app-restaurant-browsing',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        MatBadgeModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
    ],
    templateUrl: './restaurant-browsing.component.html',
    styleUrls: ['./restaurant-browsing.component.css'],
})
export class RestaurantBrowsingComponent implements OnInit {
    private restaurantBrowsingService = inject(RestaurantBrowsingService);
    private CustomerService = inject(CustomerService);
    private router = inject(Router);

    restaurants = signal<Restaurant[]>([]);
    filteredRestaurants = signal<Restaurant[]>([]);
    availableCuisines = signal<string[]>([]);
    selectedCuisine = signal<string>('all');
    searchTerm = signal<string>('');
    loading = signal<boolean>(true);
    cartCount = signal<number>(0);
    sortBy = signal<string>('rating');

    async ngOnInit() {
        await this.loadRestaurants();
        this.loadCartCount();
    }

    async loadRestaurants() {
        this.loading.set(true);
        try {
            const restaurants =
                await this.restaurantBrowsingService.getRestaurants();

            this.restaurants.set(restaurants);
            this.filteredRestaurants.set(restaurants);

            const cuisineSet = new Set<string>();
            restaurants.forEach((restaurant) => {
                cuisineSet.add(restaurant.cuisineType);
            });
            this.availableCuisines.set(Array.from(cuisineSet).sort());

            this.applyFilters();
        } catch (error) {
            console.error('Could not load restaurants:', error);
        } finally {
            this.loading.set(false);
        }
    }

    applyFilters() {
        let filtered = [...this.restaurants()];

        if (this.selectedCuisine() !== 'all') {
            filtered = filtered.filter(
                (restaurant) =>
                    restaurant.cuisineType?.toLowerCase() ===
                    this.selectedCuisine().toLowerCase()
            );
        }

        if (this.searchTerm().trim()) {
            const term = this.searchTerm().toLowerCase().trim();
            filtered = filtered.filter(
                (restaurant) =>
                    restaurant.name?.toLowerCase().includes(term) ||
                    restaurant.cuisineType?.toLowerCase().includes(term) ||
                    restaurant.address?.toLowerCase().includes(term) ||
                    restaurant.description?.toLowerCase().includes(term)
            );
        }

        filtered = this.sortRestaurants(filtered);
        this.filteredRestaurants.set(filtered);
    }

    sortRestaurants(restaurants: Restaurant[]): Restaurant[] {
        const sortBy = this.sortBy();

        const deliveryTime = (time: string | undefined): number => {
            if (!time) return 999;
            const match = time.match(/\d+/);
            return match ? parseInt(match[0], 10) : 999;
        };

        return [...restaurants].sort((a, b) => {
            switch (sortBy) {
                case 'rating': {
                    return (b.rating || 0) - (a.rating || 0);
                }
                case 'deliveryTime': {
                    const timeA = deliveryTime(a.deliveryTime);

                    const timeB = deliveryTime(b.deliveryTime);

                    console.log('Sorting delivery time:', {
                        aName: a.name,
                        aDeliveryTime: a.deliveryTime,
                        timeA,
                        bName: b.name,
                        bDeliveryTime: b.deliveryTime,
                        timeB,
                        result: timeA - timeB,
                    });

                    return timeA - timeB;
                }
                case 'name': {
                    return (a.name || '').localeCompare(b.name || '');
                }
                default:
                    return 0;
            }
        });
    }

    viewRestaurantMenu(restaurant: Restaurant, event?: MouseEvent): void {
        event?.stopPropagation();

        this.router.navigate(['/customer/menu', restaurant.restaurantId]);
    }

    async loadCartCount() {
        try {
            const count = await this.CustomerService.getCartCount();
            this.cartCount.set(count);
        } catch (error) {
            console.error('Could not load cart count:', error);

            try {
                const cartS = localStorage.getItem('cart');
                if (cartS) {
                    const cart = JSON.parse(cartS);
                    this.cartCount.set(
                        cart.reduce(
                            (sum: number, item: any) => sum + item.quantity,
                            0
                        )
                    );
                }
            } catch (error) {
                console.error('Could not load cart count:', error);
            }
        }
    }

    clearFilters() {
        this.selectedCuisine.set('all');
        this.searchTerm.set('');
        this.sortBy.set('rating');
        this.applyFilters();
    }

    updateSelectedCuisine(cuisine: string) {
        this.selectedCuisine.set(cuisine);
        this.applyFilters();
    }

    updateSearchTerm(term: string) {
        this.searchTerm.set(term);
        this.applyFilters();
    }

    updateSortBy(sort: string) {
        this.sortBy.set(sort);
        this.applyFilters();
    }

    trackByRestaurantId(index: number, restaurant: Restaurant) {
        return restaurant.restaurantId;
    }
}
