import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const canLoadGuard: CanMatchFn = () => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);

    return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
