import { Repository } from '../commons/abstract-repository.js';

export interface AddressRow {
    address_id: number;
    label: string;
    street_name: string;
    house_number: string;
    additional_info: string;
    city_name: string;
    zip_code: string;
    country: string;
    grid_x: number | null;
    grid_y: number | null;
    created_at: Date;
    updated_at: Date;
}

export class AddressRepository extends Repository<AddressRow> {
    constructor() {
        super('address', 'address_id');
    }

    create(item: Partial<AddressRow>): Promise<AddressRow> {
        const query = `
            INSERT INTO ${this.tableName}
            (label, street_name, house_number, additional_info, city_name, zip_code, country, grid_x, grid_y, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING *;
        `;
        const values = [
            item.label || null,
            item.street_name,
            item.house_number,
            item.additional_info || null,
            item.city_name,
            item.zip_code,
            item.country,
            item.grid_x ?? null,
            item.grid_y ?? null,
        ];

        return this.query(query, values).then(
            (res) => res.rows[0] as AddressRow
        );
    }

    async update(id: number, item: Partial<AddressRow>): Promise<AddressRow> {
        const query = `
            UPDATE ${this.tableName}
            SET label = COALESCE($1, label),
                street_name = COALESCE($2, street_name),
                house_number = COALESCE($3, house_number),
                additional_info = COALESCE($4, additional_info),
                city_name = COALESCE($5, city_name),
                zip_code = COALESCE($6, zip_code),
                country = COALESCE($7, country),
                grid_x = COALESCE($8, grid_x),
                grid_y = COALESCE($9, grid_y),
                updated_at = NOW()
            WHERE ${this.primaryKey} = $10
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
            item.grid_x,
            item.grid_y,
            id,
        ];

        const result = await this.query<AddressRow>(query, values);
        return result.rows[0];
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
