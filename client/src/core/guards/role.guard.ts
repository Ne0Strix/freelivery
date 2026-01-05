import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const roleGuard: CanActivateFn = (route) => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);

    const allowedRoles: string[] = route.data?.['roles'] || [];

    if (auth.isLoggedIn() && auth.hasAnyRole(allowedRoles)) {
        return true;
    }

    return router.createUrlTree(['/login']);
};
