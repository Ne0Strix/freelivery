import bcrypt from 'bcrypt';
import { ConflictError, ValidationError } from '../commons/errors.js';
import { AddressRepository } from '../location/address.repository.js';
import {
    AddressService,
    type CreateAddress,
} from '../location/address.service.js';
import { RestaurantRepository } from '../restaurant/restaurant.repository.js';
import {
    CuisineType,
    RestaurantService,
} from '../restaurant/restaurant.service.js';
import {
    UserRepository,
    type UserRow,
    type UserWithRoles,
} from './user.repository.js';

const SALT_ROUNDS = 10;

const DEFAULT_DELIVERY_ZONE_ID = 1;

/** DTO for customer signup data */
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
    private userRepository = new UserRepository();
    private addressService = new AddressService(new AddressRepository());
    private restaurantService = new RestaurantService(
        new RestaurantRepository()
    );

    async userExists(email: string, username: string): Promise<boolean> {
        return this.userRepository.existsByEmailOrUsername(email, username);
    }

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
        // Check if user already exists
        const exists = await this.userRepository.existsByEmailOrUsername(
            email,
            username
        );
        if (exists) {
            throw new ConflictError(
                'User with this email or username already exists'
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await this.userRepository.createUser(
            username,
            email,
            passwordHash
        );

        // Get role ID and assign
        const roleId = await this.userRepository.getRoleIdByName(roleName);
        if (!roleId) {
            throw new Error('Role not found in database');
        }
        await this.userRepository.assignRole(user.user_id, roleId);

        // Create empty user_data record
        await this.userRepository.createUserData(user.user_id);

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
                deliveryZoneId: DEFAULT_DELIVERY_ZONE_ID,
            });
        }

        return { userId: user.user_id };
    }
}
export interface User {
    userId: number;
    username: string;
    email: string;
    userData: UserData;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserData {
    userId: number;
    firstName: string;
    lastName: string;
    salutation: string;
    phoneNumber: string;
    dateOfBirth: Date;
}

export interface Role {
    roleId: number;
    name: string;
    description: string;
}
