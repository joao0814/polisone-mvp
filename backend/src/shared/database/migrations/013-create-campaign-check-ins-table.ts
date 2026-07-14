import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createCampaignCheckInsTableMigration: Migration = {
  name: '013-create-campaign-check-ins-table',

  async up(client: PoolClient) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaign_check_ins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
        member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
        city_ibge_code VARCHAR(7) NOT NULL,
        city_name VARCHAR(120) NOT NULL,
        state CHAR(2) NOT NULL,
        type VARCHAR(40) NOT NULL DEFAULT 'FIELD_VISIT',
        notes TEXT,
        checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS campaign_check_ins_campaign_idx
      ON campaign_check_ins (campaign_id, checked_in_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS campaign_check_ins_city_idx
      ON campaign_check_ins (city_ibge_code, state)
    `);
  },

  async validate(client: PoolClient) {
    const result = await client.query(`
      SELECT to_regclass('public.campaign_check_ins') AS table_name
    `);

    if (!result.rows[0]?.table_name) {
      throw new Error(
        'Validation failed: campaign_check_ins table does not exist',
      );
    }
  },
};
