import { Routes } from '@angular/router';
import { CartPageComponent } from './cart-page/cart-page.component';
import { CheckoutComponent } from './checkout-page/checkout-page.component';
import { CustomerHomeComponent } from './customer-home/customer-home.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { OrderTrackingComponent } from './order-tracking/order-tracking.component';
import { RestaurantBrowsingComponent } from './restaurant-browsing/restaurant-browsing.component';
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
        path: 'menu/:restaurantId',
        component: ViewMenuComponent,
    },
    {
        path: 'cart',
        component: CartPageComponent,
    },
    { path: 'checkout', component: CheckoutComponent },
    {
        path: 'tracking',
        component: OrderTrackingComponent,
    },
    {
        path: 'feedback',
        component: FeedbackComponent,
    },
    {
        path: 'restaurants',
        component: RestaurantBrowsingComponent,
    },
] satisfies Routes;
