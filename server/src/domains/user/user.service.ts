import bcrypt from 'bcrypt';
import { ConflictError } from '../commons/errors.js';
import { UserRepository, type UserRow } from './user.repository.js';

const SALT_ROUNDS = 10;

export class UserService {
    private userRepository = new UserRepository();

    async userExists(email: string, username: string): Promise<boolean> {
        return this.userRepository.existsByEmailOrUsername(email, username);
    }

    async findUserForLogin(
        identifier: string,
        byEmail: boolean
    ): Promise<UserRow | null> {
        return this.userRepository.findByEmailOrUsername(identifier, byEmail);
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
        roleName: string
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

        return { userId: user.user_id };
    }
}

export type { UserRow };
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
