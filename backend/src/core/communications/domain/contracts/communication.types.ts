import { CommunicationStatus } from '../enums/communication-status.enum';
export interface ListCommunicationsInput {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  publishedFrom?: string;
  publishedTo?: string;
  status?: CommunicationStatus;
}
export interface CreateCommunicationInput {
  title: string;
  description: string;
  content: string;
  categoryId: string;
  tags?: string[];
}
export interface UpdateCommunicationInput {
  title?: string;
  description?: string;
  content?: string;
  categoryId?: string;
  tags?: string[];
}
export interface CategoryOutput {
  id: string;
  name: string;
  slug: string;
}
export interface TagOutput {
  id: string;
  name: string;
  slug: string;
}
export interface CommunicationOutput {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  status: CommunicationStatus;
  category: CategoryOutput | null;
  authorId: string;
  tags: TagOutput[];
  publishedAt: Date | null;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}
export interface PaginatedCommunicationsOutput {
  data: CommunicationOutput[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
export interface CommunicationMetricsOutput {
  communicationId: string;
  views: number;
}
