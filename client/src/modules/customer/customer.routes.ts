import { Routes } from '@angular/router';
import { ProfileComponent } from '../profile/profile.component';
import { CartPageComponent } from './cart-page/cart-page.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';
import { ViewMenuComponent } from './view-menu/view-menu.component';

export default [
    {
        path: '',
        component: CustomerHomeComponent,
    },
    {
        path: 'home',
        component: CustomerHomeComponent,
    },
    {
        path: 'menu',
        component: ViewMenuComponent,
    },
    {
        path: 'cart',
        component: CartPageComponent,
    },
    {
        path: 'tracking',
        component: OrderTrackingComponent,
    },
    {
        path: 'feedback',
        component: FeedbackComponent,
    },
    {
        path: 'profile',
        component: ProfileComponent,
    },
] satisfies Routes;
