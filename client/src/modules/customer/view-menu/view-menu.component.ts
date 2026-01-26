import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { MenuItem } from '../customer.model';

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
    menuItems: MenuItem[] = [
        {
            dishId: 1,
            name: 'Pizza Margherita',
            description: 'Tasty tomato sauce and mozzarella pizza',
            price: 8.5,
            category: 'Pizza',
            photo: '🍕',
        },
        {
            dishId: 2,
            name: 'Hamburger',
            description: 'Fresh beef burger with cheese and salad',
            price: 9.5,
            category: 'Burgers',
            photo: '🍔',
        },
        {
            dishId: 3,
            name: 'Pasta al pomodoro',
            description: 'Pasta with homemade tomato sauce',
            price: 10.0,
            category: 'Pasta',
            photo: '🍝',
        },
        {
            dishId: 4,
            name: 'Strawberry Cake',
            description: 'Fresh strawbery cake',
            price: 7.9,
            category: 'Dessert',
            photo: '🍰',
        },
    ];
    categories = ['All', 'Pizza', 'Burgers', 'Pasta', 'Dessert'];
    selectedCategory = 'All';
    cartCount = 0;

    constructor(private snackBar: MatSnackBar) {}

    get filteredItems(): MenuItem[] {
        if (this.selectedCategory == 'All') {
            return this.menuItems;
        }
        return this.menuItems.filter(
            (item) => item.category === this.selectedCategory
        );
    }

    addToCart(item: MenuItem) {
        this.cartCount++;
        this.snackBar.open(`Added ${item.name} to cart!`, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
        });
    }
}
