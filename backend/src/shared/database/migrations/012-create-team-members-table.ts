import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createTeamMembersTableMigration: Migration = {
  name: '012-create-team-members-table',

  async up(client: PoolClient) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        name VARCHAR(140) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(80) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
          CHECK (status IN ('ACTIVE', 'INACTIVE')),
        city_ibge_code VARCHAR(7),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS team_members_team_idx
      ON team_members (team_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS team_members_city_idx
      ON team_members (city_ibge_code)
    `);
  },

  async validate(client: PoolClient) {
    const result = await client.query(`
      SELECT to_regclass('public.team_members') AS table_name
    `);

    if (!result.rows[0]?.table_name) {
      throw new Error('Validation failed: team_members table does not exist');
    }
  },
};
