import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { UserRole } from '../../commons/model/role.model';
import { RoleLabelPipe } from '../../commons/pipes/role-label.pipe';
import { AuthenticationService } from '../../commons/services/authentication.service';

@Component({
    selector: 'app-signup',
    imports: [ReactiveFormsModule, RouterLink, RoleLabelPipe],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent {
    form: FormGroup;

    readonly availableRoles = Object.values(UserRole);

    constructor(
        private fb: FormBuilder,
        private authenticationService: AuthenticationService,
        private router: Router,
        private snackbar: MatSnackBar
    ) {
        this.form = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: [UserRole.CUSTOMER, Validators.required],
        });
    }

    signup() {
        if (this.form.invalid) {
            this.snackbar.open('Please fill in all fields correctly', 'Close', {
                duration: 3000,
            });
            return;
        }

        const { username, email, password, role } = this.form.value;

        this.authenticationService
            .signup(username, email, password, role)
            .subscribe((result) => {
                if (result.success) {
                    this.snackbar.open(
                        'Account created successfully! Please log in.',
                        'Close',
                        { duration: 5000 }
                    );
                    this.router.navigateByUrl('/login');
                } else {
                    this.snackbar.open(
                        result.error || 'Signup failed',
                        'Close',
                        { duration: 5000 }
                    );
                }
            });
    }
}
