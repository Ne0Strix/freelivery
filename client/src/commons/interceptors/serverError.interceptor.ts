import {
    HttpErrorResponse,
    HttpEvent,
    HttpResponse,
    HttpStatusCode,
    type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
// source: https://dev.to/cezar-plescan/error-handling-with-angular-interceptors-2548

class HttpResponseFormatError extends Error {
    constructor() {
        super('The server response format is invalid.');
    }
}

export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const snackbar = inject(MatSnackBar);
    const authService = inject(AuthenticationService);
    const router = inject(Router);

    return next(req).pipe(
        tap((httpEvent) => {
            if (checkInvalid200Response(httpEvent)) {
                snackbar.open('Server response format is invalid.', 'Close', {
                    duration: 5000,
                });
                const error = new HttpResponseFormatError();

                console.warn(error);
                throw error;
            }
        }),
        catchError((err) => {
            if (err instanceof HttpResponseFormatError) {
                return throwError(() => err);
            }

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

            return throwError(() => err);
        })
    );
};

function checkInvalid200Response(httpEvent: HttpEvent<any>): boolean {
    return (
        // Must be an instance of HttpResponse (i.e., a response, not a request or other event)
        httpEvent instanceof HttpResponse &&
        // Must have a successful status code (200 OK)
        httpEvent.status === HttpStatusCode.Ok &&
        // But the body format must be invalid
        !check200ResponseBodyFormat(httpEvent)
    );
}

function check200ResponseBodyFormat(response: HttpResponse<any>): boolean {
    const body = response.body;
    if (typeof body !== 'object' || body === null || Array.isArray(body))
        return false;
    return (body as any).status === 'ok' && (body as any).data !== undefined;
}
