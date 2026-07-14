import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createTeamsTableMigration: Migration = {
  name: '011-create-teams-table',

  async up(client: PoolClient) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        name VARCHAR(140) NOT NULL,
        city_ibge_code VARCHAR(7) NOT NULL,
        city_name VARCHAR(120) NOT NULL,
        state CHAR(2) NOT NULL,
        coordinator_name VARCHAR(140),
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
          CHECK (status IN ('ACTIVE', 'INACTIVE')),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS teams_campaign_idx
      ON teams (campaign_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS teams_city_idx
      ON teams (city_ibge_code, state)
    `);
  },

  async validate(client: PoolClient) {
    const teamResult = await client.query(`
      SELECT to_regclass('public.teams') AS table_name
    `);

    if (!teamResult.rows[0]?.table_name) {
      throw new Error('Validation failed: teams table does not exist');
    }
  },
};
