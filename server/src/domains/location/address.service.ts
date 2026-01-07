import { AddressRepository } from './address.repository.js';
import { DeliveryZone } from './deliveryZone.model.js';

export interface Address {
    addressId: number;
    label: string;
    streetName: string;
    houseNumber: string;
    additionalInfo: string;
    cityName: string;
    zipCode: string;
    country: string;
    deliveryZone: DeliveryZone;
    createdAt: Date;
    updatedAt: Date;
}

export class AddressService {
    constructor(private repository: AddressRepository) {}

    public getAllForUser(userId: number): Promise<Address[]> {
        return this.repository.getAllForUser(userId).then((rows: any[]) => {
            return rows.map((row: any) => ({
                addressId: row.address_id,
                label: row.label,
                streetName: row.street_name,
                houseNumber: row.house_number,
                additionalInfo: row.additional_info,
                cityName: row.city_name,
                zipCode: row.zip_code,
                country: row.country,
                deliveryZone: {
                    deliveryZoneId: row.delivery_zone_id,
                    code: row.delivery_zone_code ?? row.code ?? '',
                    name: row.delivery_zone_name ?? row.name ?? '',
                    description:
                        row.delivery_zone_description ?? row.description ?? '',
                } as DeliveryZone,
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
            }));
        });
    }
}
