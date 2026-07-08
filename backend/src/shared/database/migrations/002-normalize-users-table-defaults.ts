import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

function hasExpectedDefault(
  value: string | null | undefined,
  expectedFragments: string[],
): boolean {
  if (!value) {
    return false;
  }

  return expectedFragments.every((fragment) => value.includes(fragment));
}

export const normalizeUsersTableDefaultsMigration: Migration = {
  name: '002-normalize-users-table-defaults',

  async up(client: PoolClient) {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await client.query(`
      ALTER TABLE users
      ALTER COLUMN id SET DEFAULT gen_random_uuid(),
      ALTER COLUMN roles TYPE VARCHAR(255)[] USING roles::VARCHAR(255)[],
      ALTER COLUMN roles SET DEFAULT ARRAY['USER']::VARCHAR(255)[],
      ALTER COLUMN is_active SET DEFAULT TRUE,
      ALTER COLUMN created_at SET DEFAULT NOW(),
      ALTER COLUMN updated_at SET DEFAULT NOW()
    `);
  },

  async validate(client: PoolClient) {
    const columnsResult = await client.query<{
      column_name: string;
      column_default: string | null;
      udt_name: string;
    }>(`
      SELECT column_name, column_default, udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
    `);

    const columns = Object.fromEntries(
      columnsResult.rows.map((row) => [row.column_name, row]),
    );

    if (
      !hasExpectedDefault(columns.id?.column_default, ['gen_random_uuid'])
    ) {
      throw new Error(
        'Validation failed: users.id must default to gen_random_uuid()',
      );
    }

    if (columns.roles?.udt_name !== '_varchar') {
      throw new Error(
        'Validation failed: users.roles must be stored as varchar[]',
      );
    }

    if (
      !hasExpectedDefault(columns.roles?.column_default, ['USER']) ||
      !hasExpectedDefault(columns.roles?.column_default, ['character varying'])
    ) {
      throw new Error(
        "Validation failed: users.roles must default to ['USER']",
      );
    }

    if (!hasExpectedDefault(columns.is_active?.column_default, ['true'])) {
      throw new Error(
        'Validation failed: users.is_active must default to true',
      );
    }

    if (!hasExpectedDefault(columns.created_at?.column_default, ['now'])) {
      throw new Error(
        'Validation failed: users.created_at must default to now()',
      );
    }

    if (!hasExpectedDefault(columns.updated_at?.column_default, ['now'])) {
      throw new Error(
        'Validation failed: users.updated_at must default to now()',
      );
    }
  },
};
