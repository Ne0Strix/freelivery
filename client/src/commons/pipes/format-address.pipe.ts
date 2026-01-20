import { Pipe, PipeTransform } from '@angular/core';
import { Address } from '../services/address.service';

export type AddressFormat = 'short' | 'long';

@Pipe({
    name: 'formatAddress',
    standalone: true,
})
export class FormatAddressPipe implements PipeTransform {
    transform(
        address: Address | null | undefined,
        format: AddressFormat = 'long'
    ): string {
        if (!address) {
            return '';
        }

        if (format === 'short') {
            return `${address.streetName} ${address.houseNumber}, ${address.cityName}`;
        }

        const parts = [
            `${address.streetName} ${address.houseNumber}`,
            `${address.zipCode} ${address.cityName}`,
        ];

        if (address.additionalInfo) {
            parts.push(`(${address.additionalInfo})`);
        }

        return parts.join(', ');
    }
}
