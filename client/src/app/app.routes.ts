import { Routes } from '@angular/router';
import { LoginComponent } from '../shared/login/login.component';
import { authGuard } from '../core/guards/auth.guard';
import { roleGuard } from '../core/guards/role.guard';
import { canLoadGuard } from '../core/guards/can-load.guard';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
    },
    {
        path: 'customer',
        loadChildren: () => import('../feature/customer/customer.routes'),
        canMatch: [canLoadGuard],
        canActivate: [authGuard, roleGuard],
        data: { roles: ['customer'] },
        title: 'Customer Home',
    },
    {
        path: 'restaurant',
        loadChildren: () => import('../feature/restaurant/restaurant.routes'),
        canMatch: [canLoadGuard],
        canActivate: [authGuard, roleGuard],
        data: { roles: ['restaurant_owner'] },
        title: 'Restaurant Home',
    },
    {
        path: 'site-manager',
        loadChildren: () =>
            import('../feature/site-manager/site-manager.routes'),
        canMatch: [canLoadGuard],
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
        title: 'Site Manager Home',
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
    },
];
