import { Pool } from 'pg';

export abstract class Repository<T> {
    // TODO: find a way for centralised error handling here
    protected pool: Pool;

    constructor(
        protected tableName: string,
        protected primaryKey: string
    ) {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER,
            // Default to Docker service name when host is not provided
            host: process.env.POSTGRES_HOST ?? 'db',
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD,
            // Accept both POSTGRES_PORT and DB_PORT for compatibility with env/compose
            port: Number(
                process.env.POSTGRES_PORT ?? process.env.DB_PORT ?? 5432
            ),
        });

        this.tableName = tableName;
        this.primaryKey = primaryKey;

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
        return this.pool
            .query(
                `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
                [id]
            )
            .then((res) => res.rows[0]);
    }

    getAll(): Promise<T[]> {
        return this.pool
            .query(`SELECT * FROM ${this.tableName}`)
            .then((res) => res.rows);
    }

    deleteById(id: number): Promise<void> {
        return this.pool
            .query(
                `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
                [id]
            )
            .then(() => {});
    }

    abstract create(item: T): Promise<T>; // TODO maybe add an implementation for error handling here as well; subclasses call this on error?
    abstract update(id: number, item: Partial<T>): Promise<T>;
}
