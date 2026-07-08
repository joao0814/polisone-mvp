import {
  ListSupportTicketsOutput,
} from '../../../core/support-tickets/application/use_case/list-support-tickets.use-case';
import {
  SupportTicketMessageOutput,
  SupportTicketOutput,
} from '../../../core/support-tickets/application/shared/support-ticket.output';

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
      messages: ticket.messages.map((message) => this.messageToHTTP(message)),
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

  static messageToHTTP(message: SupportTicketMessageOutput) {
    return {
      id: message.id,
      ticket_id: message.ticketId,
      sender_id: message.senderId,
      message: message.message,
      type: message.type,
      attachments: message.attachments.map((attachment) => ({
        id: attachment.id,
        file_name: attachment.fileName,
        storage_path: attachment.storagePath,
        mime_type: attachment.mimeType,
        size: attachment.size,
        message_id: attachment.messageId,
        created_at: attachment.createdAt,
      })),
      created_at: message.createdAt,
      updated_at: message.updatedAt,
    };
  }
}
