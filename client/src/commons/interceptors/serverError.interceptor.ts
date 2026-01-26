import {
    HttpErrorResponse,
    type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
<<<<<<< HEAD
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
// source: https://dev.to/cezar-plescan/error-handling-with-angular-interceptors-2548

class HttpResponseFormatError extends Error {
    constructor() {
        super('The server response format is invalid.');
    }
}
=======
import { catchError } from 'rxjs';
>>>>>>> 705567c (Updated)

export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const snackbar = inject(MatSnackBar);
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An error occurred';

            if (error.status === 0) {
                errorMessage = 'Network error - check your connection';
            } else if (error.status === 401) {
                errorMessage = 'Unauthorized - please login';
            } else if (error.status === 403) {
                errorMessage = 'Forbidden - insufficient permissions';
            } else if (error.status === 404) {
                errorMessage = 'Resource not found';
            } else if (error.status >= 500) {
                errorMessage = 'Server error - please try again later';
            } else if (error.error?.message) {
                errorMessage = error.error.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

<<<<<<< HEAD
            if (err instanceof HttpErrorResponse) {
                // Token expired - logout and redirect
                if (err.error?.error?.code === 'TOKEN_EXPIRED') {
                    authService.logout();
                    router.navigate(['/login']);
                }

                console.error(err);
                const message =
                    err?.error?.error?.message ?? 'An error occurred';
                snackbar.open(message, 'Close', { duration: 5000 });
            } else {
                snackbar.open('Unexpected error occurred.', 'Close', {
                    duration: 5000,
                });
            }
=======
            snackbar.open(errorMessage, 'Close', {
                duration: 5000,
            });
>>>>>>> 705567c (Updated)

            console.error('HTTP Error:', error);

            // Re-throw the error so the calling code can handle it
            throw error;
        })
    );
};
