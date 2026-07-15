import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const addPlannedHeadcountToTeamsMigration: Migration = {
  name: '019-add-planned-headcount-to-teams',

  async up(client: PoolClient) {
    await client.query(`
      ALTER TABLE teams
      ADD COLUMN IF NOT EXISTS planned_headcount INTEGER
        CHECK (planned_headcount IS NULL OR planned_headcount >= 0)
    `);
  },

  async validate(client: PoolClient) {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'teams'
          AND column_name = 'planned_headcount'
      ) AS has_planned_headcount
    `);

    if (!result.rows[0]?.has_planned_headcount) {
      throw new Error('Validation failed: teams.planned_headcount column is missing');
    }
  },
};
