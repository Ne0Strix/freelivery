import type { HttpInterceptorFn } from '@angular/common/http';
// source: https://dev.to/cezar-plescan/error-handling-with-angular-interceptors-2548
export const serverErrorInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req);
};
