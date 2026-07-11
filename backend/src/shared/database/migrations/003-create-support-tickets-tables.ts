import { PoolClient } from 'pg';
import { Migration } from './migration.interface';

async function hasTable(
  client: PoolClient,
  tableName: string,
): Promise<boolean> {
  const result = await client.query<{ table_name: string }>(
    `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = $1
    `,
    [tableName],
  );

  return result.rowCount > 0;
}

async function assertColumns(
  client: PoolClient,
  tableName: string,
  columns: string[],
): Promise<void> {
  const result = await client.query<{ column_name: string }>(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
    `,
    [tableName],
  );

  const availableColumns = new Set(result.rows.map((row) => row.column_name));

  for (const column of columns) {
    if (!availableColumns.has(column)) {
      throw new Error(
        `Validation failed: ${tableName}.${column} column is missing`,
      );
    }
  }
}

export const createSupportTicketsTablesMigration: Migration = {
  name: '003-create-support-tickets-tables',

  async up(client: PoolClient) {
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_support_tickets_department') THEN
          CREATE TYPE enum_support_tickets_department AS ENUM (
            'TECHNOLOGY',
            'FINANCIAL',
            'COMMERCIAL',
            'LEGAL'
          );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_support_tickets_priority') THEN
          CREATE TYPE enum_support_tickets_priority AS ENUM (
            'LOW',
            'MEDIUM',
            'HIGH'
          );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_support_tickets_status') THEN
          CREATE TYPE enum_support_tickets_status AS ENUM (
            'OPEN',
            'IN_ANALYSIS',
            'WAITING_CUSTOMER',
            'WAITING_INTERNAL',
            'RESOLVED',
            'CLOSED'
          );
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_support_ticket_messages_type') THEN
          CREATE TYPE enum_support_ticket_messages_type AS ENUM (
            'MESSAGE',
            'STATUS_CHANGE',
            'CLOSE',
            'REOPEN',
            'SYSTEM'
          );
        END IF;
      END
      $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        protocol VARCHAR(32) NOT NULL UNIQUE,
        requester_id UUID NOT NULL REFERENCES users(id),
        subject VARCHAR(255) NOT NULL,
        department enum_support_tickets_department NOT NULL,
        subcategory VARCHAR(255),
        priority enum_support_tickets_priority NOT NULL DEFAULT 'MEDIUM',
        status enum_support_tickets_status NOT NULL DEFAULT 'OPEN',
        closed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS support_ticket_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id),
        message TEXT NOT NULL,
        type enum_support_ticket_messages_type NOT NULL DEFAULT 'MESSAGE',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS support_ticket_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES support_ticket_messages(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        storage_path VARCHAR(500) NOT NULL,
        mime_type VARCHAR(120) NOT NULL,
        size INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS support_tickets_requester_id_idx
      ON support_tickets (requester_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS support_tickets_status_idx
      ON support_tickets (status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS support_ticket_messages_ticket_id_idx
      ON support_ticket_messages (ticket_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS support_ticket_attachments_message_id_idx
      ON support_ticket_attachments (message_id)
    `);
  },

  async validate(client: PoolClient) {
    const requiredTables = [
      'support_tickets',
      'support_ticket_messages',
      'support_ticket_attachments',
    ];

    for (const tableName of requiredTables) {
      if (!(await hasTable(client, tableName))) {
        throw new Error(`Validation failed: ${tableName} table does not exist`);
      }
    }

    await assertColumns(client, 'support_tickets', [
      'id',
      'protocol',
      'requester_id',
      'subject',
      'department',
      'subcategory',
      'priority',
      'status',
      'closed_at',
      'created_at',
      'updated_at',
    ]);

    await assertColumns(client, 'support_ticket_messages', [
      'id',
      'ticket_id',
      'sender_id',
      'message',
      'type',
      'created_at',
      'updated_at',
    ]);

    await assertColumns(client, 'support_ticket_attachments', [
      'id',
      'message_id',
      'file_name',
      'storage_path',
      'mime_type',
      'size',
      'created_at',
    ]);
  },
};
