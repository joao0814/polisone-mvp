import { SupportTicketAttachmentEntity } from '../../domain/entities/support-ticket-attachment.entity';
import { SupportTicketMessageEntity } from '../../domain/entities/support-ticket-message.entity';
import { SupportTicketEntity } from '../../domain/entities/support-ticket.entity';
import { SupportTicketDepartment } from '../../domain/enums/support-ticket-department.enum';
import { SupportTicketMessageType } from '../../domain/enums/support-ticket-message-type.enum';
import { SupportTicketPriority } from '../../domain/enums/support-ticket-priority.enum';
import { SupportTicketStatus } from '../../domain/enums/support-ticket-status.enum';

export type SupportTicketAttachmentOutput = {
  id: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  size: number;
  messageId: string | null;
  createdAt: Date;
};

export type SupportTicketMessageOutput = {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  type: SupportTicketMessageType;
  attachments: SupportTicketAttachmentOutput[];
  createdAt: Date;
  updatedAt: Date;
};

export type SupportTicketOutput = {
  id: string;
  protocol: string;
  requesterId: string;
  subject: string;
  department: SupportTicketDepartment;
  subcategory: string | null;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  messages: SupportTicketMessageOutput[];
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class SupportTicketOutputMapper {
  static toOutput(ticket: SupportTicketEntity): SupportTicketOutput {
    return {
      id: ticket.id,
      protocol: ticket.protocol,
      requesterId: ticket.requesterId,
      subject: ticket.subject,
      department: ticket.department,
      subcategory: ticket.subcategory,
      priority: ticket.priority,
      status: ticket.status,
      messages: ticket.messages.map((message) => this.messageToOutput(message)),
      closedAt: ticket.closedAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }

  static messageToOutput(
    message: SupportTicketMessageEntity,
  ): SupportTicketMessageOutput {
    return {
      id: message.id,
      ticketId: message.ticketId,
      senderId: message.senderId,
      message: message.message,
      type: message.type,
      attachments: message.attachments.map((attachment) =>
        this.attachmentToOutput(attachment),
      ),
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  static attachmentToOutput(
    attachment: SupportTicketAttachmentEntity,
  ): SupportTicketAttachmentOutput {
    return {
      id: attachment.id,
      fileName: attachment.fileName,
      storagePath: attachment.storagePath,
      mimeType: attachment.mimeType,
      size: attachment.size,
      messageId: attachment.messageId,
      createdAt: attachment.createdAt,
    };
  }
}
