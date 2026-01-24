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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OwnerRestaurant } from '../../commons/model/restaurant.model';
import { UserRole } from '../../commons/model/role.model';
import { UserProfile } from '../../commons/model/user.model';
import { Address, CreateAddress } from '../../commons/services/address.service';
import { AuthenticationService } from '../../commons/services/authentication.service';
import { phoneNumberValidator } from '../../commons/validators/phone-number.validator';
import { AddressFormComponent } from '../../layout/address-form/address-form.component';
import { ProfileService } from './profile.service';

@Component({
    selector: 'app-profile',
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        AddressFormComponent,
    ],
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

    // Address state
    addresses = signal<Address[]>([]);
    restaurantAddress = signal<Address | null>(null);
    editingAddressId = signal<number | null>(null);
    addingNewAddress = signal(false);

    profileForm!: FormGroup;
    passwordForm!: FormGroup;
    restaurantForm!: FormGroup;

    isRestaurantOwner = this.authService.hasRole(UserRole.RESTAURANT_OWNER);
    isCustomer = this.authService.hasRole(UserRole.CUSTOMER);

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
            phoneNumber: ['', phoneNumberValidator()],
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
            contactPhone: ['', [Validators.required, phoneNumberValidator()]],
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

                // Load restaurant address
                const restaurantAddress =
                    await this.profileService.addresses.getRestaurantAddress();
                this.restaurantAddress.set(restaurantAddress);
            }

            // Load customer addresses
            if (this.isCustomer) {
                const addresses =
                    await this.profileService.addresses.getUserAddresses(
                        profile.userId
                    );
                this.addresses.set(addresses);
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
            this.profileForm.markAsPristine();
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
            this.restaurantForm.markAsPristine();
        } catch {
            // Error handled by interceptor
        }
    }

    // ========== Address Management (Customer) ==========

    startAddingAddress() {
        this.addingNewAddress.set(true);
        this.editingAddressId.set(null);
    }

    startEditingAddress(addressId: number) {
        this.editingAddressId.set(addressId);
        this.addingNewAddress.set(false);
    }

    cancelAddressForm() {
        this.addingNewAddress.set(false);
        this.editingAddressId.set(null);
    }

    async saveNewAddress(data: CreateAddress) {
        try {
            await this.profileService.addresses.createAddress(data);
            this.snackbar.open('Address added successfully', 'Close', {
                duration: 3000,
            });
            this.addingNewAddress.set(false);
            // Reload addresses
            const profile = this.profile();
            if (profile) {
                const addresses =
                    await this.profileService.addresses.getUserAddresses(
                        profile.userId
                    );
                this.addresses.set(addresses);
            }
        } catch {
            // Error handled by interceptor
        }
    }

    async saveEditedAddress(addressId: number, data: CreateAddress) {
        try {
            await this.profileService.addresses.updateAddress(addressId, data);
            this.snackbar.open('Address updated successfully', 'Close', {
                duration: 3000,
            });
            this.editingAddressId.set(null);
            // Reload addresses
            const profile = this.profile();
            if (profile) {
                const addresses =
                    await this.profileService.addresses.getUserAddresses(
                        profile.userId
                    );
                this.addresses.set(addresses);
            }
        } catch {
            // Error handled by interceptor
        }
    }

    async deleteAddress(addressId: number) {
        if (!confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            await this.profileService.addresses.deleteAddress(addressId);
            this.snackbar.open('Address deleted successfully', 'Close', {
                duration: 3000,
            });
            // Reload addresses
            const profile = this.profile();
            if (profile) {
                const addresses =
                    await this.profileService.addresses.getUserAddresses(
                        profile.userId
                    );
                this.addresses.set(addresses);
            }
        } catch {
            // Error handled by interceptor
        }
    }

    getAddressById(addressId: number): Address | null {
        return this.addresses().find((a) => a.addressId === addressId) ?? null;
    }

    // ========== Restaurant Address (Owner) ==========

    startEditingRestaurantAddress() {
        this.editingAddressId.set(-1); // Use -1 to indicate restaurant address editing
    }

    cancelRestaurantAddressForm() {
        this.editingAddressId.set(null);
    }

    async saveRestaurantAddress(data: CreateAddress) {
        try {
            await this.profileService.addresses.updateRestaurantAddress(data);
            this.snackbar.open(
                'Restaurant address updated successfully',
                'Close',
                { duration: 3000 }
            );
            this.editingAddressId.set(null);
            // Reload restaurant address
            const restaurantAddress =
                await this.profileService.addresses.getRestaurantAddress();
            this.restaurantAddress.set(restaurantAddress);
        } catch {
            // Error handled by interceptor
        }
    }
}
