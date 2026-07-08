import { SupportTicketEntity } from '../entities/support-ticket.entity';

export const SUPPORT_TICKET_REPOSITORY = Symbol('SUPPORT_TICKET_REPOSITORY');

export interface SupportTicketRepository {
  findById(id: string): Promise<SupportTicketEntity | null>;
  store(ticket: SupportTicketEntity): Promise<SupportTicketEntity>;
}
