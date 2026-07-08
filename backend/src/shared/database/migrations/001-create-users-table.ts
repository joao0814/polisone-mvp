import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

async function hasUniqueIndexOnEmail(client: PoolClient): Promise<boolean> {
  const result = await client.query<{
    indexname: string;
    indexdef: string;
  }>(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'users'
  `);

  return result.rows.some(
    (row) =>
      row.indexdef.includes('UNIQUE') &&
      row.indexdef.includes('(email)'),
  );
}

export const createUsersTableMigration: Migration = {
  name: '001-create-users-table',

  async up(client) {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        roles TEXT[] NOT NULL DEFAULT ARRAY['USER']::TEXT[],
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const uniqueIndexExists = await hasUniqueIndexOnEmail(client);

    if (!uniqueIndexExists) {
      await client.query(`
        CREATE UNIQUE INDEX users_email_unique_idx
        ON users (email)
      `);
    }
  },

  async validate(client) {
    const tableResult = await client.query<{
      table_name: string;
    }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'users'
    `);

    if (!tableResult.rowCount) {
      throw new Error('Validation failed: users table does not exist');
    }

    const columnsResult = await client.query<{
      column_name: string;
      data_type: string;
      udt_name: string;
      is_nullable: string;
      column_default: string | null;
    }>(`
      SELECT column_name, data_type, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    const columns = Object.fromEntries(
      columnsResult.rows.map((row) => [row.column_name, row]),
    );

    const requiredColumns = [
      'id',
      'name',
      'email',
      'password_hash',
      'roles',
      'is_active',
      'created_at',
      'updated_at',
    ];

    for (const column of requiredColumns) {
      if (!columns[column]) {
        throw new Error(`Validation failed: users.${column} column is missing`);
      }
    }

    if (columns.id.data_type !== 'uuid') {
      throw new Error('Validation failed: users.id must be uuid');
    }

    if (
      columns.roles.data_type !== 'ARRAY' ||
      !['_text', '_varchar'].includes(columns.roles.udt_name)
    ) {
      throw new Error('Validation failed: users.roles must be a text[] column');
    }

    if (columns.is_active.data_type !== 'boolean') {
      throw new Error('Validation failed: users.is_active must be boolean');
    }

    if (columns.created_at.data_type !== 'timestamp with time zone') {
      throw new Error(
        'Validation failed: users.created_at must be timestamptz',
      );
    }

    if (columns.updated_at.data_type !== 'timestamp with time zone') {
      throw new Error(
        'Validation failed: users.updated_at must be timestamptz',
      );
    }

    const primaryKeyResult = await client.query<{
      column_name: string;
    }>(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'users'
        AND tc.constraint_type = 'PRIMARY KEY'
    `);

    if (!primaryKeyResult.rows.some((row) => row.column_name === 'id')) {
      throw new Error('Validation failed: users.id must be the primary key');
    }

    const uniqueIndexExists = await hasUniqueIndexOnEmail(client);

    if (!uniqueIndexExists) {
      throw new Error('Validation failed: users.email must be unique');
    }
  },
};
