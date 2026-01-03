import { Routes } from '@angular/router';
import { CustomerHomeComponent } from '../feature/customer/customer-home/customer-home.component';
import { RestaurantHomeComponent } from '../feature/restaurant/restaurant-home/restaurant-home.component';
import { SiteManagerHomeComponent } from '../feature/site-manager/site-manager-home/site-manager-home.component';

export const routes: Routes = [
    {
        path: 'customer',
        component: CustomerHomeComponent,
        title: 'Customer Home',
    },
    {
        path: 'restaurant',
        component: RestaurantHomeComponent,
        title: 'Restaurant Home',
    },
    {
        path: 'site-manager',
        component: SiteManagerHomeComponent,
        title: 'Site Manager Home',
    },
];
