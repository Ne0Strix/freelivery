/** User profile DTO from API */
export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    roles: string[];
    firstName: string | null;
    lastName: string | null;
    salutation: string | null;
    phoneNumber: string | null;
    dateOfBirth: string | null;
}

/** DTO for updating user profile */
export interface UpdateProfile {
    email?: string;
    firstName?: string;
    lastName?: string;
    salutation?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
}

/** DTO for changing password */
export interface ChangePassword {
    currentPassword: string;
    newPassword: string;
}

/** Address with grid coordinates (shared by users and restaurants) */
export interface Address {
    addressId: number;
    label: string;
    streetName: string;
    houseNumber: string;
    additionalInfo: string;
    cityName: string;
    zipCode: string;
    country: string;
    gridX: number | null;
    gridY: number | null;
}
