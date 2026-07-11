import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createCommunicationsTablesMigration: Migration = {
  name: '004-create-communications-tables',
  async up(client: PoolClient) {
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await client.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_communications_status') THEN CREATE TYPE enum_communications_status AS ENUM ('draft','published','archived'); END IF; END $$;`,
    );
    await client.query(
      `CREATE TABLE IF NOT EXISTS communication_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) NOT NULL UNIQUE, slug VARCHAR(120) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    );
    await client.query(
      `CREATE TABLE IF NOT EXISTS communications (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), slug VARCHAR(180) NOT NULL UNIQUE, title VARCHAR(180) NOT NULL, description VARCHAR(500) NOT NULL, content TEXT NOT NULL, status enum_communications_status NOT NULL DEFAULT 'draft', category_id UUID NOT NULL REFERENCES communication_categories(id), author_id UUID NOT NULL REFERENCES users(id), published_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    );
    await client.query(
      `CREATE TABLE IF NOT EXISTS communication_tags (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(80) NOT NULL UNIQUE, slug VARCHAR(100) NOT NULL UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    );
    await client.query(
      `CREATE TABLE IF NOT EXISTS communication_tag_links (communication_id UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE, tag_id UUID NOT NULL REFERENCES communication_tags(id) ON DELETE CASCADE, PRIMARY KEY (communication_id, tag_id))`,
    );
    await client.query(
      `CREATE TABLE IF NOT EXISTS communication_views (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), communication_id UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id) ON DELETE SET NULL, session_key VARCHAR(128), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    );
    await client.query(
      `CREATE TABLE IF NOT EXISTS communication_audit_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), communication_id UUID NOT NULL REFERENCES communications(id) ON DELETE CASCADE, actor_id UUID NOT NULL REFERENCES users(id), action VARCHAR(40) NOT NULL, changes JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS communications_status_published_idx ON communications(status,published_at DESC) WHERE deleted_at IS NULL`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS communications_category_idx ON communications(category_id) WHERE deleted_at IS NULL`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS communication_views_dedupe_idx ON communication_views(communication_id,user_id,created_at DESC)`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS communication_audit_communication_idx ON communication_audit_logs(communication_id,created_at DESC)`,
    );
    await client.query(
      `INSERT INTO communication_categories(name,slug) VALUES ('Institucional','institucional'),('Avisos','avisos'),('Agenda','agenda') ON CONFLICT DO NOTHING`,
    );
  },
  async validate(client: PoolClient) {
    for (const table of [
      'communication_categories',
      'communications',
      'communication_tags',
      'communication_tag_links',
      'communication_views',
      'communication_audit_logs',
    ]) {
      const result = await client.query(
        'SELECT to_regclass($1) AS table_name',
        [`public.${table}`],
      );
      if (!result.rows[0]?.table_name)
        throw new Error(`Validation failed: ${table} table does not exist`);
    }
  },
};
