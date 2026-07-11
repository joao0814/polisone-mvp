import { CommunicationStatus } from '../enums/communication-status.enum';
import {
  CategoryOutput,
  CommunicationMetricsOutput,
  CommunicationOutput,
  CreateCommunicationInput,
  ListCommunicationsInput,
  PaginatedCommunicationsOutput,
  UpdateCommunicationInput,
} from './communication.types';

export const COMMUNICATION_REPOSITORY = Symbol('COMMUNICATION_REPOSITORY');
export interface CommunicationRepository {
  list(
    query: ListCommunicationsInput,
    admin?: boolean,
  ): Promise<PaginatedCommunicationsOutput>;
  getPublished(slug: string, userId?: string): Promise<CommunicationOutput>;
  getAdmin(id: string): Promise<CommunicationOutput>;
  listCategories(): Promise<CategoryOutput[]>;
  create(
    dto: CreateCommunicationInput,
    actorId: string,
  ): Promise<CommunicationOutput>;
  update(
    id: string,
    dto: UpdateCommunicationInput,
    actorId: string,
  ): Promise<CommunicationOutput>;
  transition(
    id: string,
    status: CommunicationStatus,
    actorId: string,
  ): Promise<CommunicationOutput>;
  remove(id: string, actorId: string): Promise<void>;
  getAudit(id: string): Promise<unknown[]>;
  getMetrics(id: string): Promise<CommunicationMetricsOutput>;
}
