import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    constructor(private http: HttpClient) {}

    // Token key used in localStorage
    private readonly tokenKey = 'jwt_token';
    // Use direct backend URL in dev; proxy is optional
    private readonly apiBase = 'http://localhost:3000/api';

    login(email: string, password: string) {
        return this.http
            .post<{
                status: string;
                data?: { token: string };
            }>(`${this.apiBase}/auth/login`, { email, password })
            .pipe(
                tap((res) => {
                    const token = res?.data?.token;
                    if (token) {
                        localStorage.setItem(this.tokenKey, token);
                    }
                }),
                map((res) => Boolean(res?.data?.token)),
                catchError(() => of(false))
            );
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
    }
}
