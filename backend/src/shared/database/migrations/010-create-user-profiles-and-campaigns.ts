import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createUserProfilesAndCampaignsMigration: Migration = {
  name: '010-create-user-profiles-and-campaigns',

  async up(client: PoolClient) {
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS profile_image_path VARCHAR(500)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(180) NOT NULL,
        candidate_name VARCHAR(180) NOT NULL,
        election_year INTEGER NOT NULL CHECK (election_year BETWEEN 2000 AND 2200),
        state CHAR(2) NOT NULL,
        intended_office VARCHAR(80) NOT NULL,
        party VARCHAR(40),
        status VARCHAR(30) NOT NULL DEFAULT 'PRE_CAMPAIGN'
          CHECK (status IN ('PRE_CAMPAIGN', 'ACTIVE', 'PAUSED', 'FINISHED')),
        start_date DATE,
        election_date DATE,
        vote_goal INTEGER CHECK (vote_goal IS NULL OR vote_goal >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS campaigns_state_election_idx
      ON campaigns (state, election_year)
    `);
  },

  async validate(client: PoolClient) {
    const campaignResult = await client.query(
      `SELECT to_regclass('public.campaigns') AS table_name`,
    );
    if (!campaignResult.rows[0]?.table_name) {
      throw new Error('Validation failed: campaigns table does not exist');
    }

    const profileColumnResult = await client.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'users'
          AND column_name = 'profile_image_path'
      `,
    );
    if (!profileColumnResult.rowCount) {
      throw new Error(
        'Validation failed: users.profile_image_path column does not exist',
      );
    }
  },
};
