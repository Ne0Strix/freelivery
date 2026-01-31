import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../cart-page/cart.service';
import { MenuItem, Restaurant } from '../customer.model';
import { RestaurantBrowsingService } from '../restaurant-browsing/restaurant-browsing.service';

import { CustomerService } from '../customer.service';

@Component({
    selector: 'app-view-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        FormsModule,
        RouterLink,
    ],
    templateUrl: './view-menu.component.html',
    styleUrls: ['./view-menu.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewMenuComponent {
    private route = inject(ActivatedRoute);
    private RestaurantBrowsingService = inject(RestaurantBrowsingService);
    private customerService = inject(CustomerService);
    private cartService = inject(CartService);
    private snackBar = inject(MatSnackBar);

    restaurantId = signal<number>(0);
    restaurant = signal<Restaurant | null>(null);
    menuItems = signal<MenuItem[]>([]);
    categories = signal<string[]>(['All']);
    selectedCategory = signal<string>('All');
    cartCount = signal<number>(0);
    loading = signal<boolean>(true);

    async ngOnInit() {
        const id = +this.route.snapshot.paramMap.get('restaurantId')!;
        this.restaurantId.set(id);
        await this.loadMenuData();
        await this.loadCartCount();
    }

    async loadMenuData() {
        this.loading.set(true);
        try {
            const { restaurant, menu, categories } =
                await this.RestaurantBrowsingService.getRestaurantWithMenu(
                    this.restaurantId()
                );

            console.log(' Menu Data Loaded;', {
                restaurant,
                menuItemsCount: menu?.length || 0,
                menuItems: menu,
                categoriesCount: categories?.length || 0,
                categories,
            });

            this.restaurant.set(restaurant || null);
            this.menuItems.set(menu || []);

            const categoriesList =
                categories && categories.length > 0
                    ? categories.filter((cat) => cat && cat.trim() !== '')
                    : [];

            this.categories.set(['All', ...categoriesList]);

            console.log(' Final State:', {
                menuItems: this.menuItems().length,
                categories: this.categories(),
                selectedCategory: this.selectedCategory(),
            });
        } catch (error) {
            console.error('Error loading menu data:', error);
            this.snackBar.open('Failed to load menu', 'Close', {
                duration: 3000,
            });
            this.menuItems.set([]);
            this.categories.set(['All']);
        } finally {
            this.loading.set(false);
        }
    }

    get filteredItems(): MenuItem[] {
        const items = this.menuItems();
        const selectedCategory = this.selectedCategory();

        console.log(' Filtering: ', {
            totalItems: items.length,
            selectedCategory,
            allItems: items,
        });

        if (!items || items.length === 0) return [];

        if (selectedCategory == 'All') {
            const filtered = items.filter(
                (item) => item?.isAvailable !== false
            );
            console.log('Filtered (All):', filtered.length, 'items');
            return filtered;
        }

        const filtered = items.filter(
            (item) =>
                item?.category === selectedCategory &&
                item?.isAvailable !== false
        );

        console.log(
            'Filtered (' + selectedCategory + '):',
            filtered.length,
            'items'
        );
        return filtered;
    }

    async addToCart(item: MenuItem) {
        const restaurant = this.restaurant();
        if (!restaurant) {
            this.snackBar.open(
                'Restaurant information not available',
                'Close',
                {
                    duration: 3000,
                }
            );
            return;
        }
        const cartItem = {
            dishId: item.dishId,
            name: item.name,
            price: item.price,
            quantity: 1,
            restaurantId: this.restaurantId(),
            restaurantName: restaurant.name,
            description: item.description,
            imageUrl: item.imageUrl,
        };

        try {
            this.cartService.addToCart(
                cartItem,
                this.restaurantId(),
                restaurant.name
            );

            this.snackBar.open(`Added ${item.name}`, 'Close', {
                duration: 3000,
            });
            await this.loadCartCount();
        } catch (error) {
            console.error('Error adding item to cart:', error);
            this.snackBar.open(`Added ${item.name}`, 'Close', {
                duration: 3000,
            });
        }
    }

    async loadCartCount() {
        try {
            const count = this.cartService.getCartCount();
            this.cartCount.set(count);
        } catch (error) {
            console.error('Error loading cart:', error);
        }
    }

    updateSelectedCategory(category: string) {
        console.log('Category changed to:', category);
        this.selectedCategory.set(category);
    }

    trackByDishId(index: number, item: MenuItem) {
        return item.dishId;
    }
}
