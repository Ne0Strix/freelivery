import {
    HttpErrorResponse,
    type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const snackbar = inject(MatSnackBar);
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    const getErrorMessage = (error: HttpErrorResponse) => {
        if (error.status === 0) {
            return 'Network error - check your connection';
        } else if (error.status === 401) {
            return 'Unauthorized - please login';
        } else if (error.status === 403) {
            return 'Forbidden - insufficient permissions';
        } else if (error.status === 404) {
            return 'Resource not found';
        } else if (error.status >= 500) {
            return 'Server error - please try again later';
        } else if (error.error?.message) {
            return error.error.message;
        } else if (error.message) {
            return error.message;
        }
    };

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const errorMessage = getErrorMessage(error);

            snackbar.open(errorMessage, 'Close', {
                duration: 5000,
            });

            console.error('HTTP Error:', error);

            if (error.status === 401) {
                authService.logout();
                router.navigate(['/login']);
            }

            throw error;
        })
    );
};
