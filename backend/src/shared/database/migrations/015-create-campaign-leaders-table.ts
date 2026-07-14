import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createCampaignLeadersTableMigration: Migration = {
  name: '015-create-campaign-leaders-table',

  async up(client: PoolClient) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaign_leaders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        name VARCHAR(140) NOT NULL,
        phone VARCHAR(20),
        city_ibge_code VARCHAR(7) NOT NULL,
        city_name VARCHAR(120) NOT NULL,
        state CHAR(2) NOT NULL,
        source VARCHAR(80),
        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
          CHECK (status IN ('ACTIVE', 'INACTIVE')),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS campaign_leaders_campaign_idx
      ON campaign_leaders (campaign_id, created_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS campaign_leaders_city_idx
      ON campaign_leaders (city_ibge_code, state)
    `);
  },

  async validate(client: PoolClient) {
    const result = await client.query(`
      SELECT to_regclass('public.campaign_leaders') AS table_name
    `);

    if (!result.rows[0]?.table_name) {
      throw new Error('Validation failed: campaign_leaders table does not exist');
    }
  },
};
