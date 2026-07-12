import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const addCoverImageToCommunicationsMigration: Migration = {
  name: '008-add-cover-image-to-communications',
  async up(client: PoolClient) {
    await client.query(
      `ALTER TABLE communications ADD COLUMN IF NOT EXISTS cover_image_path VARCHAR(500)`,
    );
    await client.query(
      `ALTER TABLE communications ADD COLUMN IF NOT EXISTS cover_image_name VARCHAR(255)`,
    );
  },
  async validate(client: PoolClient) {
    const result = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'communications' AND column_name IN ('cover_image_path', 'cover_image_name')`,
    );

    const columns = new Set(result.rows.map((row) => row.column_name));
    if (!columns.has('cover_image_path') || !columns.has('cover_image_name')) {
      throw new Error('Validation failed: communication cover image columns do not exist');
    }
  },
};
