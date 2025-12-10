import { Repository } from '../commons/abstract-repository.js';

interface AddressRow {
    address_id: number;
    label: string;
    street_name: string;
    house_number: string;
    additional_info: string;
    city_name: string;
    zip_code: string;
    country: string;
    delivery_zone_id: number;
    created_at: Date;
    updated_at: Date;
}

export class AddressRepository extends Repository<AddressRow> {
    constructor() {
        super('address', 'address_id');
    }

    create(item: AddressRow): Promise<AddressRow> {
        const query = `
            INSERT INTO ${this.tableName}
            (label, street_name, house_number, additional_info, city_name, zip_code, country, delivery_zone_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING *;
        `;
        const values = [
            item.label,
            item.street_name,
            item.house_number,
            item.additional_info,
            item.city_name,
            item.zip_code,
            item.country,
            item.delivery_zone_id,
        ];

        return this.query(query, values).then(
            (res) => res.rows[0] as AddressRow
        );
    }

    update(_id: number, _item: Partial<AddressRow>): Promise<AddressRow> {
        throw new Error('Method not implemented.');
    }

    getAllForUser(userId: number): Promise<AddressRow[]> {
        const query = `
            SELECT a.*
            FROM ${this.tableName} a
            JOIN user_address ua ON a.address_id = ua.address_id
            WHERE ua.user_id = $1;
        `;
        const values = [userId];

        return this.query(query, values).then(
            (res) => res.rows as AddressRow[]
        );
    }
}
