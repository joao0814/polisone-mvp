import { Pool } from 'pg';
import { loadLocalEnv } from './load-env';
import { migrations } from './migrations';

type Command = 'status' | 'up';

function getCommand(): Command {
  const command = process.argv[2];

  if (command === 'status' || command === 'up') {
    return command;
  }

  return 'up';
}

async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrationNames(pool: Pool): Promise<Set<string>> {
  const result = await pool.query<{ name: string }>(`
    SELECT name
    FROM schema_migrations
    ORDER BY executed_at ASC, id ASC
  `);

  return new Set(result.rows.map((row) => row.name));
}

async function run(): Promise<void> {
  loadLocalEnv();

  const command = getCommand();
  const pool = new Pool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'polisone',
  });

  try {
    await ensureMigrationsTable(pool);
    const executedNames = await getExecutedMigrationNames(pool);

    if (command === 'status') {
      for (const migration of migrations) {
        const status = executedNames.has(migration.name) ? 'applied' : 'pending';
        console.log(`${migration.name}: ${status}`);
      }

      return;
    }

    for (const migration of migrations) {
      if (!executedNames.has(migration.name)) {
        const client = await pool.connect();

        try {
          await client.query('BEGIN');
          await migration.up(client);
          await client.query(
            `
              INSERT INTO schema_migrations (name)
              VALUES ($1)
            `,
            [migration.name],
          );
          await client.query('COMMIT');
          console.log(`Applied migration: ${migration.name}`);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      }
    }

    for (const migration of migrations) {
      const client = await pool.connect();

      try {
        await migration.validate(client);
        console.log(`Validated migration: ${migration.name}`);
      } finally {
        client.release();
      }
    }
  } finally {
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
