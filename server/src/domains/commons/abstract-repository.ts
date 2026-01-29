import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { NotFoundError, toAppError } from './errors.js';

// DB related sources:
// https://medium.com/@mateogalic112/how-to-build-a-node-js-api-with-postgresql-and-typescript-best-practices-and-tips-84fee3d1c46c
//

export abstract class Repository<T> {
    private static pool: Pool | null = null;

    constructor(
        protected tableName: string,
        protected primaryKey: string
    ) {}

    /**
     * Returns the singleton database connection pool.
     * Lazily initializes the pool on first access.
     */
    protected static getPool(): Pool {
        if (!Repository.pool) {
            const requiredEnvVars = [
                'POSTGRES_USER',
                'POSTGRES_DB',
                'POSTGRES_PASSWORD',
            ];
            const missing = requiredEnvVars.filter((v) => !process.env[v]);
            if (missing.length > 0) {
                throw new Error(
                    `Missing required environment variables: ${missing.join(', ')}`
                );
            }

            Repository.pool = new Pool({
                user: process.env.POSTGRES_USER,
                host: process.env.POSTGRES_HOST ?? 'db',
                database: process.env.POSTGRES_DB,
                password: process.env.POSTGRES_PASSWORD,
                port: Number(
                    process.env.POSTGRES_PORT ?? process.env.DB_PORT ?? 5432
                ),
            });

            Repository.pool
                .connect()
                .then((client) => {
                    console.log('Connected to the database');
                    client.release();
                })
                .catch((err) => {
                    console.error('Database connection error:', err);
                });
        }

        return Repository.pool;
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
            return await Repository.getPool().query<R>(text, values as any);
        } catch (err) {
            throw toAppError(err);
        }
    }

    abstract create(item: T): Promise<T>;
    abstract update(id: number, item: Partial<T>): Promise<T>;
}
