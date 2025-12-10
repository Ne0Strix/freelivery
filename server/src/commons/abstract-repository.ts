import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { NotFoundError, toAppError } from './errors.js';

export abstract class Repository<T> {
    protected pool: Pool;

    constructor(
        protected tableName: string,
        protected primaryKey: string
    ) {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST ?? 'db',
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD,
            port: Number(
                process.env.POSTGRES_PORT ?? process.env.DB_PORT ?? 5432
            ),
        });


        this.pool
            .connect()
            .then(() => {
                console.log('Connected to the database');
            })
            .catch((err) => {
                console.error('Database connection error:', err);
            });
    }

    getById(id: number): Promise<T> {
        return this.query(
            `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
            [id]
        ).then((res) => res.rows[0] as T);
    }

    async getByIdOrThrow(
        id: number,
        opts?: {
            message?: string;
            details?: Record<string, unknown>;
        }
    ): Promise<T> {
        const res = await this.query(
            `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
            [id]
        );
        const row = res.rows[0];

        if (!row) {
            throw new NotFoundError(
                opts?.message ?? `${this.tableName} not found`,
                {
                    id,
                    ...(opts?.details ?? {}),
                }
            );
        }

        return row as T;
    }

    getAll(): Promise<T[]> {
        return this.query(`SELECT * FROM ${this.tableName}`).then(
            (res) => res.rows as T[]
        );
    }

    deleteById(id: number): Promise<void> {
        return this.query(
            `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
            [id]
        ).then(() => {});
    }

    protected async query<R extends QueryResultRow = any>(
        text: string,
        values?: unknown[]
    ): Promise<QueryResult<R>> {
        try {
            return await this.pool.query<R>(text, values as any);
        } catch (err) {
            throw toAppError(err);
        }
    }

    abstract create(item: T): Promise<T>;
    abstract update(id: number, item: Partial<T>): Promise<T>;
}
