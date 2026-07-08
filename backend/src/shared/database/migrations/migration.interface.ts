import { PoolClient } from 'pg';

export interface Migration {
  name: string;
  up: (client: PoolClient) => Promise<void>;
  validate: (client: PoolClient) => Promise<void>;
}
