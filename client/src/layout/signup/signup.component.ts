import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import {
    CuisineType,
    CustomerSignup,
    RestaurantOwnerSignup,
} from '../../commons/model/restaurant.model';
import { UserRole } from '../../commons/model/role.model';
import { RoleLabelPipe } from '../../commons/pipes/role-label.pipe';
import { CreateAddress } from '../../commons/services/address.service';
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

    readonly availableRoles = [UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER];
    readonly cuisineTypes = Object.values(CuisineType);
    readonly UserRole = UserRole;

    constructor(
        private fb: FormBuilder,
        private authenticationService: AuthenticationService,
        private router: Router,
        private snackbar: MatSnackBar
    ) {
        this.form = this.fb.group({
            // Basic user fields
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: [UserRole.CUSTOMER, Validators.required],

            // Customer-specific fields
            phoneNumber: [''],

            // Address fields (used by both customer and restaurant)
            streetName: [''],
            houseNumber: [''],
            additionalInfo: [''],
            cityName: [''],
            zipCode: [''],
            country: ['Austria'],
            gridX: [0, [Validators.min(-10), Validators.max(10)]],
            gridY: [0, [Validators.min(-10), Validators.max(10)]],

            // Restaurant-specific fields
            restaurantName: [''],
            restaurantDescription: [''],
            cuisineType: [CuisineType.ITALIAN],
            contactEmail: [''],
            contactPhone: [''],
        });

        // Set up dynamic validation based on role
        this.form.get('role')?.valueChanges.subscribe((role) => {
            this.updateValidation(role);
        });

        // Initialize validation
        this.updateValidation(UserRole.CUSTOMER);
    }

    private updateValidation(role: UserRole) {
        const phoneNumber = this.form.get('phoneNumber');
        const streetName = this.form.get('streetName');
        const houseNumber = this.form.get('houseNumber');
        const cityName = this.form.get('cityName');
        const zipCode = this.form.get('zipCode');
        const country = this.form.get('country');
        const restaurantName = this.form.get('restaurantName');
        const contactEmail = this.form.get('contactEmail');
        const contactPhone = this.form.get('contactPhone');

        // Clear all validators first
        [
            phoneNumber,
            streetName,
            houseNumber,
            cityName,
            zipCode,
            country,
            restaurantName,
            contactEmail,
            contactPhone,
        ].forEach((control) => {
            control?.clearValidators();
            control?.updateValueAndValidity();
        });

        if (role === UserRole.CUSTOMER) {
            // Customer needs phone and address
            phoneNumber?.setValidators([Validators.required]);
            streetName?.setValidators([Validators.required]);
            houseNumber?.setValidators([Validators.required]);
            cityName?.setValidators([Validators.required]);
            zipCode?.setValidators([Validators.required]);
            country?.setValidators([Validators.required]);
        } else if (role === UserRole.RESTAURANT_OWNER) {
            // Restaurant owner needs restaurant details and address
            restaurantName?.setValidators([Validators.required]);
            contactEmail?.setValidators([
                Validators.required,
                Validators.email,
            ]);
            contactPhone?.setValidators([Validators.required]);
            streetName?.setValidators([Validators.required]);
            houseNumber?.setValidators([Validators.required]);
            cityName?.setValidators([Validators.required]);
            zipCode?.setValidators([Validators.required]);
            country?.setValidators([Validators.required]);
        }

        // Update validity
        [
            phoneNumber,
            streetName,
            houseNumber,
            cityName,
            zipCode,
            country,
            restaurantName,
            contactEmail,
            contactPhone,
        ].forEach((control) => control?.updateValueAndValidity());
    }

    get selectedRole(): UserRole {
        return this.form.get('role')?.value;
    }

    signup() {
        if (this.form.invalid) {
            this.snackbar.open('Please fill in all fields correctly', 'Close', {
                duration: 3000,
            });
            return;
        }

        const formValue = this.form.value;
        const { username, email, password, role } = formValue;

        // Build address DTO from form
        const address: CreateAddress = {
            streetName: formValue.streetName,
            houseNumber: formValue.houseNumber,
            additionalInfo: formValue.additionalInfo || undefined,
            cityName: formValue.cityName,
            zipCode: formValue.zipCode,
            country: formValue.country,
            gridX: formValue.gridX,
            gridY: formValue.gridY,
        };

        // Build role-specific signup data
        let customerSignup: CustomerSignup | undefined;
        let restaurantOwnerSignup: RestaurantOwnerSignup | undefined;

        if (role === UserRole.CUSTOMER) {
            customerSignup = {
                phoneNumber: formValue.phoneNumber,
                address,
            };
        } else if (role === UserRole.RESTAURANT_OWNER) {
            restaurantOwnerSignup = {
                restaurant: {
                    name: formValue.restaurantName,
                    description: formValue.restaurantDescription || undefined,
                    cuisineType: formValue.cuisineType,
                    contactEmail: formValue.contactEmail,
                    contactPhone: formValue.contactPhone,
                    address,
                },
            };
        }

        this.authenticationService
            .signup(
                username,
                email,
                password,
                role,
                customerSignup,
                restaurantOwnerSignup
            )
            .subscribe((result) => {
                if (result.success) {
                    const message =
                        role === UserRole.RESTAURANT_OWNER
                            ? 'Restaurant registration submitted! A site manager will review your application.'
                            : 'Account created successfully! Please log in.';
                    this.snackbar.open(message, 'Close', { duration: 5000 });
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
