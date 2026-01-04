import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
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
        private router: Router
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
                        this.router.navigateByUrl('/');
                    } else {
                        console.warn('Login failed');
                    }
                });
        }
    }
}
