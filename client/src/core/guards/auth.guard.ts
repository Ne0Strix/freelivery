import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

/**
 * Combined authentication and authorization guard.
 * - Redirects to login if user is not authenticated
 * - Checks role permissions if roles are specified in route data
 */
export const authGuard: CanActivateFn = (route) => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
        return router.createUrlTree(['/login']);
    }

    const allowedRoles: string[] = route.data?.['roles'] || [];

    if (allowedRoles.length === 0) {
        return true;
    }

    return auth.hasAnyRole(allowedRoles);
};
