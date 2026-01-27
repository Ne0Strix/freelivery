import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { Category, Dish } from '../../../commons/model/restaurant.model';
import { RestaurantService } from '../../../commons/services/restaurant.service';
import { DishCardComponent } from '../../../layout/dish-card/dish-card.component';
import {
    CategoryFormComponent,
    CategoryFormResult,
} from '../category-form/category-form.component';
import {
    DishFormComponent,
    DishFormResult,
} from '../dish-form/dish-form.component';
import { RestaurantOwnerService } from '../restaurant-owner.service';

@Component({
    selector: 'app-menu-management',
    imports: [
        MatExpansionModule,
        MatButtonModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
        MatDialogModule,
        MatSnackBarModule,
        DishCardComponent,
        RouterLink,
    ],
    templateUrl: './menu-management.component.html',
    styleUrl: './menu-management.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuManagementComponent implements OnInit {
    private ownerService = inject(RestaurantOwnerService);
    private restaurantService = inject(RestaurantService);
    private dialog = inject(MatDialog);
    private snackBar = inject(MatSnackBar);

    // State
    loading = signal(true);
    restaurantId = signal<number | null>(null);
    categories = signal<Category[]>([]);
    dishes = signal<Dish[]>([]);

    // Computed: group dishes by category
    dishesByCategory = computed(() => {
        const allDishes = this.dishes();
        const categoryMap = new Map<number, Dish[]>();

        for (const category of this.categories()) {
            categoryMap.set(category.categoryId, []);
        }

        for (const dish of allDishes) {
            const categoryDishes = categoryMap.get(dish.categoryId) || [];
            categoryDishes.push(dish);
            categoryMap.set(dish.categoryId, categoryDishes);
        }

        return categoryMap;
    });

    ngOnInit(): void {
        this.loadData();
    }

    private async loadData(): Promise<void> {
        this.loading.set(true);
        try {
            const myRestaurant = await this.ownerService.getMyRestaurant();
            this.restaurantId.set(myRestaurant.restaurantId);

            const [categories, dishes] = await Promise.all([
                this.restaurantService.getCategories(myRestaurant.restaurantId),
                this.restaurantService.getDishes(myRestaurant.restaurantId),
            ]);
            this.categories.set(categories);
            this.dishes.set(dishes);
        } catch (error) {
            console.error('Failed to load menu data', error);
        } finally {
            this.loading.set(false);
        }
    }

    // =====================
    // Category Actions
    // =====================

    openCategoryDialog(category: Category | null = null): void {
        const dialogRef = this.dialog.open(CategoryFormComponent, {
            data: { category },
            width: '500px',
        });

        dialogRef
            .afterClosed()
            .subscribe(async (result: CategoryFormResult | undefined) => {
                if (!result) return;

                try {
                    if (category) {
                        // Update existing
                        const updated = await this.ownerService.updateCategory(
                            category.categoryId,
                            result
                        );
                        this.categories.update((cats) =>
                            cats.map((c) =>
                                c.categoryId === updated.categoryId
                                    ? updated
                                    : c
                            )
                        );
                        this.snackBar.open('Category updated', 'Close', {
                            duration: 3000,
                        });
                    } else {
                        // Create new
                        const created =
                            await this.ownerService.createCategory(result);
                        this.categories.update((cats) => [...cats, created]);
                        this.snackBar.open('Category created', 'Close', {
                            duration: 3000,
                        });
                    }
                } catch (error) {
                    console.error('Failed to save category', error);
                }
            });
    }

    async deleteCategory(category: Category): Promise<void> {
        if (!confirm(`Delete category "${category.name}" and all its dishes?`))
            return;

        try {
            await this.ownerService.deleteCategory(category.categoryId);
            this.categories.update((cats) =>
                cats.filter((c) => c.categoryId !== category.categoryId)
            );
            this.dishes.update((d) =>
                d.filter((dish) => dish.categoryId !== category.categoryId)
            );
            this.snackBar.open('Category deleted', 'Close', { duration: 3000 });
        } catch (error) {
            console.error('Failed to delete category', error);
        }
    }

    // =====================
    // Dish Actions
    // =====================

    openDishDialog(
        dish: Dish | null = null,
        preselectedCategoryId?: number
    ): void {
        const categories = this.categories();
        if (categories.length === 0) {
            this.snackBar.open('Please create a category first', 'Close', {
                duration: 3000,
            });
            return;
        }

        // If creating new dish with preselected category, set it
        const dialogDish = dish
            ? dish
            : preselectedCategoryId
              ? ({
                    ...this.getEmptyDish(),
                    categoryId: preselectedCategoryId,
                } as Dish)
              : null;

        const dialogRef = this.dialog.open(DishFormComponent, {
            data: { dish: dialogDish, categories },
            width: '550px',
        });

        dialogRef
            .afterClosed()
            .subscribe(async (result: DishFormResult | undefined) => {
                if (!result) return;

                try {
                    if (dish) {
                        // Update existing
                        const updated = await this.ownerService.updateDish(
                            dish.dishId,
                            result
                        );
                        this.dishes.update((d) =>
                            d.map((item) =>
                                item.dishId === updated.dishId ? updated : item
                            )
                        );
                        this.snackBar.open('Dish updated', 'Close', {
                            duration: 3000,
                        });
                    } else {
                        // Create new
                        const created =
                            await this.ownerService.createDish(result);
                        this.dishes.update((d) => [...d, created]);
                        this.snackBar.open('Dish created', 'Close', {
                            duration: 3000,
                        });
                    }
                } catch (error) {
                    console.error('Failed to save dish', error);
                }
            });
    }

    async deleteDish(dish: Dish): Promise<void> {
        if (!confirm(`Delete dish "${dish.name}"?`)) return;

        try {
            await this.ownerService.deleteDish(dish.dishId);
            this.dishes.update((d) =>
                d.filter((item) => item.dishId !== dish.dishId)
            );
            this.snackBar.open('Dish deleted', 'Close', { duration: 3000 });
        } catch (error) {
            console.error('Failed to delete dish', error);
        }
    }

    async toggleAvailability(dish: Dish): Promise<void> {
        try {
            await this.ownerService.toggleDishAvailability(dish.dishId);
            await this.loadData();
        } catch (error) {
            console.error('Failed to toggle availability', error);
        }
    }

    private getEmptyDish(): Partial<Dish> {
        return {
            name: '',
            description: null,
            price: 0,
            imageUrl: null,
            isAvailable: true,
        };
    }
}
