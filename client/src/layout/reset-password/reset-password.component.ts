import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    signal,
} from '@angular/core';
import {
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../commons/services/authentication.service';

// source: https://cinquewebdev.medium.com/how-to-implement-forgot-password-functionality-with-jwt-authentication-e1381263026c
//         https://www.codementor.io/@olatundegaruba/password-reset-using-jwt-ag2pmlck0

@Component({
    selector: 'app-reset-password',
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnInit {
    mode = signal<'request' | 'reset'>('request');
    submitted = signal(false);
    token = signal<string | null>(null);

    // Form for requesting reset (email only)
    emailControl = new FormControl('', [Validators.required, Validators.email]);
    requestForm = new FormGroup({ email: this.emailControl });

    // Form for resetting password
    passwordControl = new FormControl('', [
        Validators.required,
        Validators.minLength(6),
    ]);
    resetForm = new FormGroup({ password: this.passwordControl });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthenticationService,
        private snackbar: MatSnackBar
    ) {}

    ngOnInit(): void {
        // get token from route
        const token = this.route.snapshot.paramMap.get('token');
        if (token) {
            this.token.set(token);
            this.mode.set('reset');
        }
    }

    requestReset(): void {
        if (this.requestForm.invalid) return;

        const email = this.emailControl.value!;
        this.authService.requestPasswordReset(email).subscribe((result) => {
            this.submitted.set(true);
            this.snackbar.open(
                result.message ||
                    'If the email exists, a reset link has been sent',
                'Close',
                { duration: 5000 }
            );
        });
    }

    resetPassword(): void {
        if (this.resetForm.invalid || !this.token()) return;

        const newPassword = this.passwordControl.value!;
        this.authService
            .resetPassword(this.token()!, newPassword)
            .subscribe(() => {
                this.snackbar.open(
                    'Password reset successfully! Please log in.',
                    'Close',
                    { duration: 5000 }
                );
                this.router.navigate(['/login']);
                // Errors are handled by serverErrorInterceptor
            });
    }
}
