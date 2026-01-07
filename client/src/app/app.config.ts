import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authenticatorInterceptor } from '../commons/interceptors/authenticator.interceptor';
import { serverErrorInterceptor } from '../commons/interceptors/serverError.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(
            withInterceptors([authenticatorInterceptor, serverErrorInterceptor])
        ),
    ],
};
