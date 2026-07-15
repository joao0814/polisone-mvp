import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const addTeamMemberAccessAndForcePasswordChangeMigration: Migration = {
  name: '018-add-team-member-access-and-force-password-change',

  async up(client: PoolClient) {
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE
    `);

    await client.query(`
      ALTER TABLE team_members
      ADD COLUMN IF NOT EXISTS email VARCHAR(180),
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS team_members_user_unique_idx
      ON team_members (user_id)
      WHERE user_id IS NOT NULL
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS team_members_email_unique_idx
      ON team_members (email)
      WHERE email IS NOT NULL
    `);
  },

  async validate(client: PoolClient) {
    const result = await client.query(`
      SELECT
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'users'
            AND column_name = 'must_change_password'
        ) AS has_must_change_password,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'team_members'
            AND column_name = 'email'
        ) AS has_team_member_email,
        EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'team_members'
            AND column_name = 'user_id'
        ) AS has_team_member_user_id
    `);

    if (
      !result.rows[0]?.has_must_change_password ||
      !result.rows[0]?.has_team_member_email ||
      !result.rows[0]?.has_team_member_user_id
    ) {
      throw new Error(
        'Validation failed: missing access columns for team members or users',
      );
    }
  },
};
