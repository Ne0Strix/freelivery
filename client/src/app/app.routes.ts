import { Routes } from '@angular/router';
import { authGuard } from '../commons/guards/auth.guard';
import { UserRole } from '../commons/model/role.model';
import { LoginComponent } from '../layout/login/login.component';
import { SignupComponent } from '../layout/signup/signup.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
    },
    {
        path: 'signup',
        component: SignupComponent,
        title: 'Sign Up',
    },
    {
        path: 'customer',
        loadChildren: () => import('../modules/customer/customer.routes'),
        //canActivate: [authGuard],
        data: { roles: [UserRole.CUSTOMER] },
        title: 'Customer Home',
    },
    {
        path: 'restaurant',
        loadChildren: () =>
            import('../modules/restaurant-owner/restaurant-owner.routes'),
        canActivate: [authGuard],
        data: { roles: [UserRole.RESTAURANT_OWNER] },
        title: 'Restaurant Home',
    },
    {
        path: 'site-manager',
        loadChildren: () =>
            import('../modules/site-manager/site-manager.routes'),
        canActivate: [authGuard],
        data: { roles: [UserRole.ADMIN] },
        title: 'Site Manager Home',
    },
    {
        path: 'profile',
        loadChildren: () => import('../modules/profile/profile.routes'),
        canActivate: [authGuard],
        title: 'Profile',
    },
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
    },
];
