/** Centralized user roles - must match database role.name values */
export enum UserRole {
    ADMIN = 'admin',
    RESTAURANT_OWNER = 'restaurant_owner',
    CUSTOMER = 'customer',
}

/** Role options for UI dropdowns/selects */
export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: UserRole.CUSTOMER, label: 'Customer' },
    { value: UserRole.RESTAURANT_OWNER, label: 'Restaurant Owner' },
    { value: UserRole.ADMIN, label: 'Site Manager' },
];
