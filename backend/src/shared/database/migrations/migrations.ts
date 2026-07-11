import { Migration } from './migration.interface';
import { createUsersTableMigration } from './001-create-users-table';
import { normalizeUsersTableDefaultsMigration } from './002-normalize-users-table-defaults';
import { createSupportTicketsTablesMigration } from './003-create-support-tickets-tables';
import { createCommunicationsTablesMigration } from './004-create-communications-tables';

export const migrations: Migration[] = [
  createUsersTableMigration,
  normalizeUsersTableDefaultsMigration,
  createSupportTicketsTablesMigration,
  createCommunicationsTablesMigration,
];
