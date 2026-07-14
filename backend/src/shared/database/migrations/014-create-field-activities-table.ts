import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createFieldActivitiesTableMigration: Migration = {
  name: '014-create-field-activities-table',

  async up(client: PoolClient) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS field_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
        member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
        city_ibge_code VARCHAR(7) NOT NULL,
        city_name VARCHAR(120) NOT NULL,
        state CHAR(2) NOT NULL,
        activity_type VARCHAR(80) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        notes TEXT,
        happened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS field_activities_campaign_idx
      ON field_activities (campaign_id, happened_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS field_activities_city_idx
      ON field_activities (city_ibge_code, state)
    `);
  },

  async validate(client: PoolClient) {
    const result = await client.query(`
      SELECT to_regclass('public.field_activities') AS table_name
    `);

    if (!result.rows[0]?.table_name) {
      throw new Error('Validation failed: field_activities table does not exist');
    }
  },
};
