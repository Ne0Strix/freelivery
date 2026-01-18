import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OwnerRestaurant } from '../../commons/model/restaurant.model';
import { UserRole } from '../../commons/model/role.model';
import { UserProfile } from '../../commons/model/user.model';
import { AuthenticationService } from '../../commons/services/authentication.service';
import { ProfileService } from './profile.service';

@Component({
    selector: 'app-profile',
    imports: [ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
    private profileService = inject(ProfileService);
    private authService = inject(AuthenticationService);
    private fb = inject(FormBuilder);
    private snackbar = inject(MatSnackBar);

    profile = signal<UserProfile | null>(null);
    restaurant = signal<OwnerRestaurant | null>(null);
    loading = signal(true);

    profileForm!: FormGroup;
    passwordForm!: FormGroup;
    restaurantForm!: FormGroup;

    isRestaurantOwner = this.authService.hasRole(UserRole.RESTAURANT_OWNER);

    ngOnInit() {
        this.initForms();
        this.loadProfile();
    }

    private initForms() {
        this.profileForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            firstName: [''],
            lastName: [''],
            salutation: [''],
            phoneNumber: [''],
            dateOfBirth: [''],
        });

        this.passwordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
        });

        this.restaurantForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            contactEmail: ['', [Validators.required, Validators.email]],
            contactPhone: ['', Validators.required],
            maxDeliveryDistance: [
                5,
                [Validators.required, Validators.min(1), Validators.max(20)],
            ],
        });
    }

    private async loadProfile() {
        try {
            const profile = await this.profileService.getProfile();
            this.profile.set(profile);

            this.profileForm.patchValue({
                email: profile.email,
                firstName: profile.firstName ?? '',
                lastName: profile.lastName ?? '',
                salutation: profile.salutation ?? '',
                phoneNumber: profile.phoneNumber ?? '',
                dateOfBirth: profile.dateOfBirth
                    ? profile.dateOfBirth.split('T')[0]
                    : '',
            });

            // Load restaurant if user is owner
            if (this.isRestaurantOwner) {
                const restaurant = await this.profileService.getRestaurant();
                this.restaurant.set(restaurant);

                if (restaurant) {
                    this.restaurantForm.patchValue({
                        name: restaurant.name,
                        description: restaurant.description ?? '',
                        contactEmail: restaurant.contactEmail,
                        contactPhone: restaurant.contactPhone,
                        maxDeliveryDistance: restaurant.maxDeliveryDistance,
                    });
                }
            }
        } catch {
            // Error handled by interceptor
        } finally {
            this.loading.set(false);
        }
    }

    async saveProfile() {
        if (this.profileForm.invalid) {
            this.snackbar.open('Please fill in all required fields', 'Close', {
                duration: 3000,
            });
            return;
        }

        try {
            await this.profileService.updateProfile(this.profileForm.value);
            this.snackbar.open('Profile updated successfully', 'Close', {
                duration: 3000,
            });
        } catch {
            // Error handled by interceptor
        }
    }

    async changePassword() {
        if (this.passwordForm.invalid) {
            this.snackbar.open('Please fill in all password fields', 'Close', {
                duration: 3000,
            });
            return;
        }

        const { currentPassword, newPassword, confirmPassword } =
            this.passwordForm.value;

        if (newPassword !== confirmPassword) {
            this.snackbar.open('New passwords do not match', 'Close', {
                duration: 3000,
            });
            return;
        }

        try {
            await this.profileService.changePassword({
                currentPassword,
                newPassword,
            });
            this.snackbar.open('Password changed successfully', 'Close', {
                duration: 3000,
            });
            this.passwordForm.reset();
        } catch {
            // Error handled by interceptor
        }
    }

    async saveRestaurant() {
        if (this.restaurantForm.invalid) {
            this.snackbar.open('Please fill in all required fields', 'Close', {
                duration: 3000,
            });
            return;
        }

        try {
            await this.profileService.updateRestaurant(
                this.restaurantForm.value
            );
            this.snackbar.open('Restaurant updated successfully', 'Close', {
                duration: 3000,
            });
        } catch {
            // Error handled by interceptor
        }
    }
}
