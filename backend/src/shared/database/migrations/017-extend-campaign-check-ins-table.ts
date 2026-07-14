import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const extendCampaignCheckInsTableMigration: Migration = {
  name: '017-extend-campaign-check-ins-table',

  async up(client: PoolClient) {
    await client.query(`
      ALTER TABLE campaign_check_ins
      ADD COLUMN IF NOT EXISTS person_type VARCHAR(20)
        CHECK (person_type IN ('LEADER', 'REPRESENTATIVE')),
      ADD COLUMN IF NOT EXISTS person_id UUID,
      ADD COLUMN IF NOT EXISTS person_name VARCHAR(140),
      ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'CHECKED_IN'
        CHECK (status IN ('CHECKED_IN', 'CHECKED_OUT', 'CANCELED'))
    `);

    await client.query(`
      UPDATE campaign_check_ins
      SET
        person_type = COALESCE(person_type, 'REPRESENTATIVE'),
        person_id = COALESCE(person_id, member_id),
        person_name = COALESCE(person_name, 'Pessoa em campo')
      WHERE person_type IS NULL
         OR person_name IS NULL
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS campaign_check_ins_person_idx
      ON campaign_check_ins (campaign_id, person_type, person_id, status)
    `);
  },

  async validate(client: PoolClient) {
    const result = await client.query(`
      SELECT
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'campaign_check_ins'
            AND column_name = 'person_type'
        ) AS has_person_type,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'campaign_check_ins'
            AND column_name = 'status'
        ) AS has_status
    `);

    if (!result.rows[0]?.has_person_type || !result.rows[0]?.has_status) {
      throw new Error(
        'Validation failed: campaign_check_ins table missing extended columns',
      );
    }
  },
};
