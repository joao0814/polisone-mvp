import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createCalendarEventsTableMigration: Migration = {
  name: '005-create-calendar-events-table',
  async up(client: PoolClient) {
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await client.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_calendar_events_status') THEN CREATE TYPE enum_calendar_events_status AS ENUM ('active','completed','canceled'); END IF; END $$;`,
    );
    await client.query(
      `CREATE TABLE IF NOT EXISTS calendar_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(180) NOT NULL, description TEXT, event_date DATE NOT NULL, all_day BOOLEAN NOT NULL DEFAULT TRUE, start_time TIME, end_time TIME, category VARCHAR(80), status enum_calendar_events_status NOT NULL DEFAULT 'active', created_by UUID NOT NULL REFERENCES users(id), updated_by UUID REFERENCES users(id), deleted_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CONSTRAINT calendar_events_time_consistency CHECK ((all_day = TRUE AND start_time IS NULL AND end_time IS NULL) OR (all_day = FALSE AND start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)))`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS calendar_events_event_date_idx ON calendar_events(event_date) WHERE deleted_at IS NULL`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS calendar_events_status_date_idx ON calendar_events(status,event_date) WHERE deleted_at IS NULL`,
    );
  },
  async validate(client: PoolClient) {
    const result = await client.query('SELECT to_regclass($1) AS table_name', [
      'public.calendar_events',
    ]);
    if (!result.rows[0]?.table_name)
      throw new Error(
        'Validation failed: calendar_events table does not exist',
      );
  },
};
