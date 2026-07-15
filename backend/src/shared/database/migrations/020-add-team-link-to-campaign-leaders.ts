import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const addTeamLinkToCampaignLeadersMigration: Migration = {
  name: '020-add-team-link-to-campaign-leaders',

  async up(client: PoolClient) {
    await client.query(`
      ALTER TABLE campaign_leaders
      ADD COLUMN IF NOT EXISTS team_id UUID NULL
        REFERENCES teams(id)
        ON DELETE SET NULL
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_campaign_leaders_team_id
      ON campaign_leaders(team_id)
    `);
  },

  async validate(client: PoolClient) {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'campaign_leaders'
          AND column_name = 'team_id'
      ) AS has_team_id
    `);

    if (!result.rows[0]?.has_team_id) {
      throw new Error('Validation failed: campaign_leaders.team_id column is missing');
    }
  },
};
