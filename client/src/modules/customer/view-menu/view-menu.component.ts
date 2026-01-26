import { Component } from '@angular/core';
import { MenuItem } from '../customer.model';

@Component({
    selector: 'app-view-menu',
    templateUrl: './view-menu.component.html',
    styleUrls: ['./view-menu.component.css'],
})
export class ViewMenuComponent {
    menuItems = [
        {
            id: 1,
            name: 'Pizza Margherita',
            price: 8.5,
            category: 'Pizza',
            image: '🍕',
        },
        {
            id: 2,
            name: 'Hamburger',
            price: 9.5,
            category: 'Burgers',
            image: '🍔',
        },
        {
            id: 3,
            name: 'Pasta al pomodoro',
            price: 10.0,
            category: 'Pasta',
            image: '🍝',
        },
        {
            id: 4,
            name: 'Strawberry Cake',
            price: 7.9,
            category: 'Dessert',
            image: '🍰',
        },
    ];
    categories = ['All', 'Pizza', 'Burgers', 'Pasta', 'Dessert'];
    selectedCategory = 'All';
    cartCount = 0;

    get filteredItems() {
        if (this.selectedCategory == 'All') {
            return this.menuItems;
        }
        return this.menuItems.filter(
            (item) => item.category === this.selectedCategory
        );
    }

    selectCategory(category: string) {
        this.selectedCategory = category;
    }

    addToCart(item: MenuItem) {
        this.cartCount++;
        alert(`Added ${item.name} to cart! (${this.cartCount} item total)`);
    }
}
