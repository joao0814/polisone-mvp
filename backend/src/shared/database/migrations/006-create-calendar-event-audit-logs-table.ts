import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

export const createCalendarEventAuditLogsTableMigration: Migration = {
  name: '006-create-calendar-event-audit-logs-table',
  async up(client: PoolClient) {
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await client.query(
      `CREATE TABLE IF NOT EXISTS calendar_event_audit_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), calendar_event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE, actor_id UUID NOT NULL REFERENCES users(id), action VARCHAR(40) NOT NULL, changes JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS calendar_event_audit_logs_event_idx ON calendar_event_audit_logs(calendar_event_id,created_at DESC)`,
    );
  },
  async validate(client: PoolClient) {
    const result = await client.query('SELECT to_regclass($1) AS table_name', [
      'public.calendar_event_audit_logs',
    ]);
    if (!result.rows[0]?.table_name)
      throw new Error(
        'Validation failed: calendar_event_audit_logs table does not exist',
      );
  },
};
