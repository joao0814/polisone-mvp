import { SupportTicketAttachmentEntity } from '../../../../domain/entities/support-ticket-attachment.entity';
import { SupportTicketMessageEntity } from '../../../../domain/entities/support-ticket-message.entity';
import { SupportTicketEntity } from '../../../../domain/entities/support-ticket.entity';
import { SupportTicketAttachmentModel } from './support-ticket-attachment.model';
import { SupportTicketMessageModel } from './support-ticket-message.model';
import { SupportTicketModel } from './support-ticket.model';

export class SupportTicketModelMapper {
  static toEntity(model: SupportTicketModel): SupportTicketEntity {
    return SupportTicketEntity.create({
      id: model.id,
      protocol: model.protocol,
      requesterId: model.requesterId,
      subject: model.subject,
      department: model.department,
      subcategory: model.subcategory,
      priority: model.priority,
      status: model.status,
      closedAt: model.closedAt,
      messages: (model.messages ?? []).map((message) =>
        this.messageToEntity(message),
      ),
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  static toModel(ticket: SupportTicketEntity): Partial<SupportTicketModel> {
    return {
      id: ticket.id,
      protocol: ticket.protocol,
      requesterId: ticket.requesterId,
      subject: ticket.subject,
      department: ticket.department,
      subcategory: ticket.subcategory,
      priority: ticket.priority,
      status: ticket.status,
      closedAt: ticket.closedAt,
    };
  }

  static messageToEntity(
    message: SupportTicketMessageModel,
  ): SupportTicketMessageEntity {
    return SupportTicketMessageEntity.create({
      id: message.id,
      ticketId: message.ticketId,
      senderId: message.senderId,
      message: message.message,
      type: message.type,
      attachments: (message.attachments ?? []).map((attachment) =>
        this.attachmentToEntity(attachment),
      ),
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    });
  }

  static attachmentToEntity(
    attachment: SupportTicketAttachmentModel,
  ): SupportTicketAttachmentEntity {
    return SupportTicketAttachmentEntity.create({
      id: attachment.id,
      fileName: attachment.fileName,
      storagePath: attachment.storagePath,
      mimeType: attachment.mimeType,
      size: attachment.size,
      messageId: attachment.messageId,
      createdAt: attachment.createdAt,
    });
  }
}
