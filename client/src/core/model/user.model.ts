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
