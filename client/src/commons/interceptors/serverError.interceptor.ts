import {
    HttpErrorResponse,
    type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs';

export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const snackbar = inject(MatSnackBar);

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

            snackbar.open(errorMessage, 'Close', {
                duration: 5000,
            });

            console.error('HTTP Error:', error);

            // Re-throw the error so the calling code can handle it
            throw error;
        })
    );
};
