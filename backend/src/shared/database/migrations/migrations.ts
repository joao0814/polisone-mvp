import { Migration } from './migration.interface';
import { createUsersTableMigration } from './001-create-users-table';
import { normalizeUsersTableDefaultsMigration } from './002-normalize-users-table-defaults';
import { createSupportTicketsTablesMigration } from './003-create-support-tickets-tables';
import { createCommunicationsTablesMigration } from './004-create-communications-tables';
import { createCalendarEventsTableMigration } from './005-create-calendar-events-table';
import { createCalendarEventAuditLogsTableMigration } from './006-create-calendar-event-audit-logs-table';
import { addCalendarEventRecurrenceFieldsMigration } from './007-add-calendar-event-recurrence-fields';

export const migrations: Migration[] = [
  createUsersTableMigration,
  normalizeUsersTableDefaultsMigration,
  createSupportTicketsTablesMigration,
  createCommunicationsTablesMigration,
  createCalendarEventsTableMigration,
  createCalendarEventAuditLogsTableMigration,
  addCalendarEventRecurrenceFieldsMigration,
];
