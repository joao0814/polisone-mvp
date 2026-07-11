import { randomUUID } from 'crypto';
import { SupportTicketAttachmentEntity } from './support-ticket-attachment.entity';
import { SupportTicketMessageType } from '../enums/support-ticket-message-type.enum';

export type SupportTicketMessageProps = {
  id?: string;
  ticketId: string;
  senderId: string;
  message: string;
  type?: SupportTicketMessageType;
  attachments?: SupportTicketAttachmentEntity[];
  createdAt?: Date;
  updatedAt?: Date;
};

export class SupportTicketMessageEntity {
  private constructor(
    private readonly props: Required<SupportTicketMessageProps>,
  ) {}

  static create(props: SupportTicketMessageProps): SupportTicketMessageEntity {
    const message = new SupportTicketMessageEntity({
      id: props.id ?? randomUUID(),
      ticketId: props.ticketId,
      senderId: props.senderId,
      message: props.message,
      type: props.type ?? SupportTicketMessageType.MESSAGE,
      attachments: props.attachments ?? [],
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });

    message.validate();
    return message;
  }

  get id(): string {
    return this.props.id;
  }

  get ticketId(): string {
    return this.props.ticketId;
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get message(): string {
    return this.props.message;
  }

  get type(): SupportTicketMessageType {
    return this.props.type;
  }

  get attachments(): SupportTicketAttachmentEntity[] {
    return [...this.props.attachments];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private validate(): void {
    if (!this.props.ticketId) {
      throw new Error('Support ticket message ticket id is required');
    }

    if (!this.props.senderId) {
      throw new Error('Support ticket message sender id is required');
    }

    if (!this.props.message.trim()) {
      throw new Error('Support ticket message content is required');
    }
  }
}
