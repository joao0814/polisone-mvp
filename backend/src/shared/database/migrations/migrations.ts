import { Migration } from './migration.interface';
import { createUsersTableMigration } from './001-create-users-table';
import { normalizeUsersTableDefaultsMigration } from './002-normalize-users-table-defaults';

export const migrations: Migration[] = [
  createUsersTableMigration,
  normalizeUsersTableDefaultsMigration,
];
