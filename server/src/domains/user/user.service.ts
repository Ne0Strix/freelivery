import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ConflictError, ValidationError } from '../commons/errors.js';
import { getUserRepository } from '../commons/repository-registry.js';
import {
    AddressService,
    type CreateAddress,
} from '../location/address.service.js';
import {
    CuisineType,
    RestaurantService,
} from '../restaurant/restaurant.service.js';
import type { UserRow, UserWithRoles } from './user.repository.js';

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY = '15m';

export interface CustomerSignupData {
    phoneNumber?: string;
    address?: CreateAddress;
}

/** DTO for restaurant owner signup - uses CreateAddress for nested address */
export interface RestaurantSignupData {
    name: string;
    description?: string;
    cuisineType: CuisineType;
    contactEmail: string;
    contactPhone: string;
    address: CreateAddress;
}

export class UserService {
    private userRepository = getUserRepository();
    private addressService = new AddressService();
    private restaurantService = new RestaurantService();

    async findUserIncludingInactive(
        identifier: string,
        byEmail: boolean
    ): Promise<UserRow | null> {
        return this.userRepository.findByEmailOrUsernameIncludingInactive(
            identifier,
            byEmail
        );
    }

    async getAllUsersWithRoles(): Promise<UserWithRoles[]> {
        return this.userRepository.findAllWithRoles();
    }

    async setActiveStatus(
        userId: number,
        isActive: boolean,
        adminUserId: number
    ): Promise<void> {
        if (!isActive && userId === adminUserId) {
            throw new ValidationError('Cannot suspend your own account');
        }
        await this.userRepository.setActiveStatus(userId, isActive);
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    async getUserRoles(userId: number): Promise<string[]> {
        return this.userRepository.getUserRoles(userId);
    }

    async createUser(
        username: string,
        email: string,
        password: string,
        roleName: string,
        customerData?: CustomerSignupData,
        restaurantData?: RestaurantSignupData
    ): Promise<{ userId: number }> {
        const trimmed_email = this.validateAndTrimEmail(email);
        const trimmed_username = this.validateAndTrimUsername(username);
        const exists = await this.userRepository.existsByEmailOrUsername(
            trimmed_email,
            trimmed_username
        );
        if (exists) {
            throw new ConflictError(
                'User with this email or username already exists'
            );
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await this.userRepository.createUser(
            trimmed_username,
            trimmed_email,
            passwordHash
        );

        // Get role ID and assign
        const roleId = await this.userRepository.getRoleIdByName(roleName);
        if (!roleId) {
            throw new Error('Role not found in database');
        }
        await this.userRepository.assignRole(user.user_id, roleId);

        await this.userRepository.createEmptyUserData(user.user_id);

        // Handle customer-specific data
        if (customerData) {
            // Update phone number
            if (customerData.phoneNumber) {
                await this.userRepository.updateUserDataPhone(
                    user.user_id,
                    customerData.phoneNumber
                );
            }

            // Create address and link to user
            if (customerData.address) {
                const addressId = await this.addressService.createAddress({
                    ...customerData.address,
                    label: 'Home',
                });
                await this.userRepository.linkUserAddress(
                    user.user_id,
                    addressId,
                    true
                );
            }
        }

        // Handle restaurant owner-specific data
        if (restaurantData) {
            // Create restaurant address
            const addressId = await this.addressService.createAddress({
                ...restaurantData.address,
                label: restaurantData.name,
            });

            // Create restaurant with NEW status (pending approval)
            await this.restaurantService.createRestaurant({
                name: restaurantData.name,
                description: restaurantData.description,
                cuisineType: restaurantData.cuisineType,
                contactEmail: restaurantData.contactEmail,
                contactPhone: restaurantData.contactPhone,
                addressId: addressId,
                ownerUserId: user.user_id,
            });
        }

        return { userId: user.user_id };
    }

    // https://www.xjavascript.com/blog/email-validation-regex-typescript/
    validateAndTrimEmail(email: string): string {
        const emailRegex: RegExp =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;

        const trimmedEmail = email.trim();

        if (!emailRegex.test(trimmedEmail)) {
            throw new ValidationError('Invalid email format');
        }
        return trimmedEmail;
    }

    validateAndTrimUsername(username: string): string {
        const usernameRegex: RegExp = /^[a-zA-Z0-9_]{3,20}$/;

        const trimmedUsername = username.trim();

        if (!usernameRegex.test(trimmedUsername)) {
            throw new ValidationError(
                'Username must be 3-20 characters long and can only contain letters, numbers, and underscores'
            );
        }
        return trimmedUsername;
    }

    async getProfile(userId: number): Promise<UserProfile> {
        const user = await this.userRepository.getByIdOrThrow(userId, {
            message: 'User not found',
        });
        const userData = await this.userRepository.getUserData(userId);
        const roles = await this.userRepository.getUserRoles(userId);

        return {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            roles,
            firstName: userData?.first_name ?? null,
            lastName: userData?.last_name ?? null,
            salutation: userData?.salutation ?? null,
            phoneNumber: userData?.phone_number ?? null,
            dateOfBirth: userData?.date_of_birth ?? null,
        };
    }

    async updateProfile(
        userId: number,
        data: UpdateProfileData
    ): Promise<void> {
        // Check email uniqueness if changing
        if (data.email) {
            const emailTaken = await this.userRepository.isEmailTakenByOther(
                data.email,
                userId
            );
            if (emailTaken) {
                throw new ConflictError('Email is already in use');
            }
            await this.userRepository.updateEmail(userId, data.email);
        }

        // Update user_data fields
        await this.userRepository.updateUserData(userId, {
            first_name: data.firstName,
            last_name: data.lastName,
            salutation: data.salutation,
            phone_number: data.phoneNumber,
            date_of_birth: data.dateOfBirth,
        });
    }

    async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const user = await this.userRepository.getByIdOrThrow(userId, {
            message: 'User not found',
        });

        const isValid = await bcrypt.compare(
            currentPassword,
            user.password_hash
        );
        if (!isValid) {
            throw new ValidationError('Current password is incorrect');
        }

        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await this.userRepository.updatePasswordHash(userId, newHash);
    }

    /** Request password reset - generates token and logs reset link to console */
    async requestPasswordReset(email: string): Promise<void> {
        const user =
            await this.userRepository.findByEmailOrUsernameIncludingInactive(
                email,
                true
            );
        if (!user) {
            // Don't reveal if email exists
            return;
        }

        const secret = process.env.JWT_SECRET || 'dev-secret';
        const token = jwt.sign({ sub: user.user_id }, secret, {
            expiresIn: RESET_TOKEN_EXPIRY,
        });

        await this.userRepository.setResetToken(user.user_id, token);

        const resetLink = `http://localhost:4200/reset-password/${token}`;
        console.log(`\n🔐 Password Reset Link for ${email}:\n${resetLink}\n`);
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const secret = process.env.JWT_SECRET || 'dev-secret';

        let decoded: { sub: number };
        try {
            decoded = jwt.verify(token, secret) as { sub: number };
        } catch {
            throw new ValidationError('Invalid or expired reset token');
        }

        // Find user and verify token matches
        const user = await this.userRepository.findByResetToken(token);
        if (!user || user.user_id !== decoded.sub) {
            throw new ValidationError('Invalid or expired reset token');
        }

        // Hash new password and update
        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await this.userRepository.updatePasswordHash(user.user_id, newHash);
        await this.userRepository.clearResetToken(user.user_id);
    }
}

/** DTO for user profile response */
export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    roles: string[];
    firstName: string | null;
    lastName: string | null;
    salutation: string | null;
    phoneNumber: string | null;
    dateOfBirth: Date | null;
}

export interface UpdateProfileData {
    email?: string;
    firstName?: string;
    lastName?: string;
    salutation?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
}
