import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { LoginComponent } from '../shared/login/login.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
    },
    {
        path: 'customer',
        loadChildren: () => import('../feature/customer/customer.routes'),
        canActivate: [authGuard],
        data: { roles: ['customer'] },
        title: 'Customer Home',
    },
    {
        path: 'restaurant',
        loadChildren: () => import('../feature/restaurant/restaurant.routes'),
        canActivate: [authGuard],
        data: { roles: ['restaurant_owner'] },
        title: 'Restaurant Home',
    },
    {
        path: 'site-manager',
        loadChildren: () =>
            import('../feature/site-manager/site-manager.routes'),
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
