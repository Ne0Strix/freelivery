import { Routes } from '@angular/router';
import { authGuard } from '../commons/guards/auth.guard';
import { LoginComponent } from '../layout/login/login.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
    },
    {
        path: 'customer',
        loadChildren: () => import('../modules/customer/customer.routes'),
        canActivate: [authGuard],
        data: { roles: ['customer'] },
        title: 'Customer Home',
    },
    {
        path: 'restaurant',
        loadChildren: () =>
            import('../modules/restaurant-owner/restaurant-owner.routes'),
        canActivate: [authGuard],
        data: { roles: ['restaurant_owner'] },
        title: 'Restaurant Home',
    },
    {
        path: 'site-manager',
        loadChildren: () =>
            import('../modules/site-manager/site-manager.routes'),
        canActivate: [authGuard],
        data: { roles: ['admin'] },
        title: 'Site Manager Home',
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
    },
];
