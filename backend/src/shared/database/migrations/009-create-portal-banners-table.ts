import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createPortalBannersTableMigration: Migration = {
  name: '009-create-portal-banners-table',
  async up(client: PoolClient) {
    await client.query(
      `CREATE TABLE IF NOT EXISTS portal_banners (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(180) NOT NULL, link_url VARCHAR(500), image_path VARCHAR(500) NOT NULL, image_name VARCHAR(255) NOT NULL, is_active BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS portal_banners_active_idx ON portal_banners(is_active, updated_at DESC)`,
    );
  },
  async validate(client: PoolClient) {
    const result = await client.query('SELECT to_regclass($1) AS table_name', ['public.portal_banners']);
    if (!result.rows[0]?.table_name) {
      throw new Error('Validation failed: portal_banners table does not exist');
    }
  },
};
