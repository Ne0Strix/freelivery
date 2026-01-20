import { Routes } from '@angular/router';
import { MenuManagementComponent } from './menu-management/menu-management.component';
import { OpeningHoursManagementComponent } from './opening-hours-management/opening-hours-management.component';
import { OrderReceptionComponent } from './order-reception/order-reception.component';
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
    {
        path: 'orders',
        component: OrderReceptionComponent,
    },
    {
        path: 'opening-hours',
        component: OpeningHoursManagementComponent,
    },
] satisfies Routes;
