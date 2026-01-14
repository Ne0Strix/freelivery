import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from '../model/role.model';

const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.CUSTOMER]: 'Customer',
    [UserRole.RESTAURANT_OWNER]: 'Restaurant Owner',
    [UserRole.ADMIN]: 'Site Manager',
};

@Pipe({
    name: 'roleLabel',
    standalone: true,
})
export class RoleLabelPipe implements PipeTransform {
    transform(role: string): string {
        return ROLE_LABELS[role as UserRole] || role;
    }
}
