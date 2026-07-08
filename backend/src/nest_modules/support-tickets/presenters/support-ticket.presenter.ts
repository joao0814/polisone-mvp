import {
  ListSupportTicketsOutput,
} from '../../../core/support-tickets/application/use_case/list-support-tickets.use-case';
import { SupportTicketOutput } from '../../../core/support-tickets/application/shared/support-ticket.output';

export class SupportTicketPresenter {
  static toHTTP(ticket: SupportTicketOutput) {
    return {
      id: ticket.id,
      protocol: ticket.protocol,
      requester_id: ticket.requesterId,
      subject: ticket.subject,
      department: ticket.department,
      subcategory: ticket.subcategory,
      priority: ticket.priority,
      status: ticket.status,
      closed_at: ticket.closedAt,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt,
    };
  }

  static listToHTTP(output: ListSupportTicketsOutput) {
    return {
      items: output.items.map((item) => this.toHTTP(item)),
      meta: {
        total: output.total,
        page: output.page,
        limit: output.limit,
      },
    };
  }
}
