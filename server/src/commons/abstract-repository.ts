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

        // Validate identifiers to prevent SQL injection
        this.tableName = this.validateIdentifier(tableName);
        this.primaryKey = this.validateIdentifier(primaryKey);

        this.pool
            .connect()
            .then(() => {
                console.log('Connected to the database');
            })
            .catch((err) => {
                console.error('Database connection error:', err);
            });
    }

    /**
     * Validates and sanitizes SQL identifiers (table/column names) to prevent SQL injection.
     * Only allows alphanumeric characters, underscores, and must start with a letter or underscore.
     * @param identifier - The identifier to validate
     * @returns The validated identifier
     * @throws Error if identifier is invalid
     */
    protected validateIdentifier(identifier: string): string {
        if (!identifier || typeof identifier !== 'string') {
            throw new Error('Identifier must be a non-empty string');
        }

        // PostgreSQL identifier rules: start with letter or underscore, contain only alphanumeric and underscores
        const validIdentifierPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
        
        if (!validIdentifierPattern.test(identifier)) {
            throw new Error(
                `Invalid identifier: ${identifier}. Identifiers must start with a letter or underscore and contain only alphanumeric characters and underscores.`
            );
        }

        return identifier;
    }

    /**
     * Safely quotes an identifier for use in SQL queries.
     * This uses PostgreSQL's double-quote escaping rules.
     * @param identifier - The validated identifier to quote
     * @returns The quoted identifier
     */
    protected quoteIdentifier(identifier: string): string {
        // Escape double quotes by doubling them, then wrap in double quotes
        return '"' + identifier.replace(/"/g, '""') + '"';
    }

    getById(id: number): Promise<T> {
        const query = `SELECT * FROM ${this.quoteIdentifier(this.tableName)} WHERE ${this.quoteIdentifier(this.primaryKey)} = $1`;
        return this.pool
            .query(query, [id])
            .then((res) => res.rows[0]);
    }

    getAll(): Promise<T[]> {
        const query = `SELECT * FROM ${this.quoteIdentifier(this.tableName)}`;
        return this.pool
            .query(query)
            .then((res) => res.rows);
    }

    deleteById(id: number): Promise<void> {
        const query = `DELETE FROM ${this.quoteIdentifier(this.tableName)} WHERE ${this.quoteIdentifier(this.primaryKey)} = $1`;
        return this.pool
            .query(query, [id])
            .then(() => {});
    }

    abstract create(item: T): Promise<T>; // TODO maybe add an implementation for error handling here as well; subclasses call this on error?
    abstract update(id: number, item: Partial<T>): Promise<T>;
}
