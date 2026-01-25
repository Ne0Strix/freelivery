import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { UserRole } from '../../commons/model/role.model';
import { AuthenticationService } from '../../commons/services/authentication.service';
// source https://blog.angular-university.io/angular-jwt-authentication/
@Component({
    selector: 'app-login',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    form: FormGroup;

    readonly email = new FormControl('', [
        Validators.required,
        Validators.email,
    ]);
    readonly password = new FormControl('', [Validators.required]);

    constructor(
        private fb: FormBuilder,
        private authenticationService: AuthenticationService,
        private router: Router,
        private snackbar: MatSnackBar
    ) {
        this.form = this.fb.group({
            email: this.email,
            password: this.password,
        });
    }

    login() {
        const val = this.form.value;

        if (val.email && val.password) {
            this.authenticationService
                .login(val.email, val.password)
                .subscribe((result) => {
                    if (result.success) {
                        console.log('User is logged in');
                        // Navigate based on user's primary role
                        const roles = this.authenticationService.roles();
                        if (roles.includes(UserRole.ADMIN)) {
                            this.router.navigateByUrl('/site-manager');
                        } else if (roles.includes(UserRole.RESTAURANT_OWNER)) {
                            this.router.navigateByUrl('/restaurant');
                        } else if (roles.includes(UserRole.CUSTOMER)) {
                            this.router.navigateByUrl('/customer');
                        } else {
                            // Fallback - stay on login or show error
                            this.snackbar.open(
                                'User has no recognized role',
                                'Close',
                                { duration: 5000 }
                            );
                        }
                    } else if (result.code === 'ACCOUNT_SUSPENDED') {
                        this.snackbar.open(
                            'Your account has been suspended. Please contact support.',
                            'Close',
                            { duration: 8000 }
                        );
                    } else if (result.code === 'RESTAURANT_PENDING') {
                        this.snackbar.open(
                            'Your restaurant registration is pending approval. Please wait for a site manager to review your application.',
                            'Close',
                            { duration: 8000 }
                        );
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
