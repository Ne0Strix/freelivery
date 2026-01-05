import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/services/authentication.service';
// source https://blog.angular-university.io/angular-jwt-authentication/
@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    form: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authenticationService: AuthenticationService,
        private router: Router,
        private snackbar: MatSnackBar
    ) {
        this.form = this.fb.group({
            email: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    login() {
        const val = this.form.value;

        if (val.email && val.password) {
            this.authenticationService
                .login(val.email, val.password)
                .subscribe((ok) => {
                    if (ok) {
                        console.log('User is logged in');
                        // Navigate based on user's primary role
                        const roles = this.authenticationService.roles();
                        if (roles.includes('admin')) {
                            this.router.navigateByUrl('/site-manager');
                        } else if (roles.includes('restaurant_owner')) {
                            this.router.navigateByUrl('/restaurant');
                        } else if (roles.includes('customer')) {
                            this.router.navigateByUrl('/customer');
                        } else {
                            // Fallback - stay on login or show error
                            this.snackbar.open(
                                'User has no recognized role',
                                'Close',
                                { duration: 5000 }
                            );
                        }
                    } else {
                        this.snackbar.open(
                            'Invalid email or password',
                            'Close',
                            { duration: 5000 }
                        );
                    }
                });
        }
    }
}
