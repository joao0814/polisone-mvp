import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const addCalendarEventRecurrenceFieldsMigration: Migration = {
  name: '007-add-calendar-event-recurrence-fields',
  async up(client: PoolClient) {
    await client.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_calendar_events_recurrence_type') THEN CREATE TYPE enum_calendar_events_recurrence_type AS ENUM ('none','daily','weekly','monthly','yearly'); END IF; END $$;`,
    );
    await client.query(
      `ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS recurrence_type enum_calendar_events_recurrence_type NOT NULL DEFAULT 'none'`,
    );
    await client.query(
      `ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER NOT NULL DEFAULT 1`,
    );
    await client.query(
      `ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS recurrence_until DATE`,
    );
    await client.query(
      `ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS recurrence_days INTEGER[]`,
    );
  },
  async validate(client: PoolClient) {
    const result = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name IN ('recurrence_type','recurrence_interval','recurrence_until','recurrence_days')`,
    );
    if ((result.rows?.length ?? 0) < 4) {
      throw new Error(
        'Validation failed: recurrence columns do not exist in calendar_events',
      );
    }
  },
};
