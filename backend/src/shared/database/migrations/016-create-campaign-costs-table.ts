import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createCampaignCostsTableMigration: Migration = {
  name: '016-create-campaign-costs-table',

  async up(client: PoolClient) {
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaign_costs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        city_ibge_code VARCHAR(7) NOT NULL,
        city_name VARCHAR(120) NOT NULL,
        region_id VARCHAR(80) NOT NULL,
        region_name VARCHAR(120) NOT NULL,
        amount NUMERIC(14,2) NOT NULL,
        notes TEXT,
        spent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS campaign_costs_campaign_idx
      ON campaign_costs (campaign_id, spent_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS campaign_costs_region_idx
      ON campaign_costs (region_id)
    `);
  },

  async validate(client: PoolClient) {
    const result = await client.query(`
      SELECT to_regclass('public.campaign_costs') AS table_name
    `);

    if (!result.rows[0]?.table_name) {
      throw new Error('Validation failed: campaign_costs table does not exist');
    }
  },
};
