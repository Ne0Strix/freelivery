import { Routes } from '@angular/router';
import { MenuManagementComponent } from './menu-management/menu-management.component';
import { RestaurantHomeComponent } from './restaurant-home/restaurant-home.component';

export default [
    {
        path: '',
        component: RestaurantHomeComponent,
    },
    {
        path: 'menu',
        component: MenuManagementComponent,
    },
] satisfies Routes;
