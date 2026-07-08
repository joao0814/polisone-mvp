import { SupportTicketMessageEntity } from '../entities/support-ticket-message.entity';
import { SupportTicketEntity } from '../entities/support-ticket.entity';
import { SupportTicketStatus } from '../enums/support-ticket-status.enum';

export const SUPPORT_TICKET_REPOSITORY = Symbol('SUPPORT_TICKET_REPOSITORY');

export type SupportTicketListFilters = {
  requesterId?: string;
  includeClosed?: boolean;
  onlyClosed?: boolean;
  search?: string;
  page: number;
  limit: number;
};

export type SupportTicketListResult = {
  items: SupportTicketEntity[];
  total: number;
  page: number;
  limit: number;
};

export interface SupportTicketRepository {
  findById(id: string): Promise<SupportTicketEntity | null>;
  findByProtocol(protocol: string): Promise<SupportTicketEntity | null>;
  findMany(filters: SupportTicketListFilters): Promise<SupportTicketListResult>;
  addMessage(
    message: SupportTicketMessageEntity,
  ): Promise<SupportTicketMessageEntity>;
  updateStatus(
    id: string,
    status: SupportTicketStatus,
    closedAt?: Date | null,
  ): Promise<SupportTicketEntity | null>;
  store(ticket: SupportTicketEntity): Promise<SupportTicketEntity>;
}
