import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { catchError, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
    CustomerSignup,
    RestaurantOwnerSignup,
} from '../model/restaurant.model';

interface JwtPayload {
    sub: number;
    username: string;
    email: string;
    roles: string[];
    exp: number;
}

interface LoginResult {
    success: boolean;
    code?: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    constructor(private http: HttpClient) {
        // Initialize from localStorage on service creation
        const token = this.getToken();
        if (token) {
            this.decodeAndSetUser(token);
        }
    }

    // Token key used in localStorage
    private readonly tokenKey = 'jwt_token';
    // Use direct backend URL in dev; proxy is optional
    private readonly apiBase = 'http://localhost:3000/api';

    private _isLoggedIn = signal(false);
    private _userRoles = signal<string[]>([]);
    private _userId = signal<number | null>(null);

    readonly isLoggedIn = computed(() => this._isLoggedIn());
    readonly roles = computed(() => this._userRoles());
    readonly userId = computed(() => this._userId());

    login(email: string, password: string) {
        return this.http
            .post<{
                status: string;
                data?: { token: string };
                code?: string;
            }>(`${this.apiBase}/auth/login`, { email, password })
            .pipe(
                tap((res) => {
                    const token = res?.data?.token;
                    if (token) {
                        localStorage.setItem(this.tokenKey, token);
                        this.decodeAndSetUser(token);
                    }
                }),
                map(
                    (res): LoginResult => ({
                        success: Boolean(res?.data?.token),
                    })
                ),
                catchError((err) =>
                    of({
                        success: false,
                        code: err.error?.code,
                    } as LoginResult)
                )
            );
    }

    signup(
        username: string,
        email: string,
        password: string,
        role: string,
        customerSignup?: CustomerSignup,
        restaurantOwnerSignup?: RestaurantOwnerSignup
    ) {
        // Build request body based on role
        const body: Record<string, unknown> = {
            username,
            email,
            password,
            role,
        };

        if (customerSignup) {
            body['phoneNumber'] = customerSignup.phoneNumber;
            body['address'] = customerSignup.address;
        }

        if (restaurantOwnerSignup) {
            body['restaurant'] = restaurantOwnerSignup.restaurant;
        }

        return this.http
            .post<{
                status: string;
                data?: { message: string; userId: number };
                error?: string;
            }>(`${this.apiBase}/auth/signup`, body)
            .pipe(
                map((res) => ({
                    success: res.status === 'ok',
                    message: res.data?.message,
                    error: res.error,
                })),
                catchError((err) =>
                    of({
                        success: false,
                        message: undefined,
                        error: err.error?.error || 'Signup failed',
                    })
                )
            );
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        this._isLoggedIn.set(false);
        this._userRoles.set([]);
        this._userId.set(null);
    }

    hasRole(role: string): boolean {
        return this._userRoles().includes(role);
    }

    hasAnyRole(roles: string[]): boolean {
        if (roles.length === 0) {
            return false;
        }
        const userRoles = this._userRoles();
        return roles.some((role) => userRoles.includes(role));
    }

    private decodeAndSetUser(token: string): void {
        try {
            const decoded = jwtDecode<JwtPayload>(token);

            // Check if token is expired
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                this.logout();
                return;
            }

            this._isLoggedIn.set(true);
            this._userRoles.set(decoded.roles || []);
            this._userId.set(decoded.sub);
        } catch {
            // Invalid token
            this.logout();
        }
    }
}
