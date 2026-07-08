import { randomUUID } from 'crypto';
import { SupportTicketDepartment } from '../enums/support-ticket-department.enum';
import { SupportTicketPriority } from '../enums/support-ticket-priority.enum';
import { SupportTicketStatus } from '../enums/support-ticket-status.enum';
import { SupportTicketMessageEntity } from './support-ticket-message.entity';

export type SupportTicketProps = {
  id?: string;
  protocol: string;
  requesterId: string;
  subject: string;
  department: SupportTicketDepartment;
  subcategory?: string | null;
  priority?: SupportTicketPriority;
  status?: SupportTicketStatus;
  messages?: SupportTicketMessageEntity[];
  closedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class SupportTicketEntity {
  private constructor(private readonly props: Required<SupportTicketProps>) {}

  static create(props: SupportTicketProps): SupportTicketEntity {
    const ticket = new SupportTicketEntity({
      id: props.id ?? randomUUID(),
      protocol: props.protocol,
      requesterId: props.requesterId,
      subject: props.subject,
      department: props.department,
      subcategory: props.subcategory ?? null,
      priority: props.priority ?? SupportTicketPriority.MEDIUM,
      status: props.status ?? SupportTicketStatus.OPEN,
      messages: props.messages ?? [],
      closedAt: props.closedAt ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    });

    ticket.validate();
    return ticket;
  }

  get id(): string {
    return this.props.id;
  }

  get protocol(): string {
    return this.props.protocol;
  }

  get requesterId(): string {
    return this.props.requesterId;
  }

  get subject(): string {
    return this.props.subject;
  }

  get department(): SupportTicketDepartment {
    return this.props.department;
  }

  get subcategory(): string | null {
    return this.props.subcategory;
  }

  get priority(): SupportTicketPriority {
    return this.props.priority;
  }

  get status(): SupportTicketStatus {
    return this.props.status;
  }

  get messages(): SupportTicketMessageEntity[] {
    return [...this.props.messages];
  }

  get closedAt(): Date | null {
    return this.props.closedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private validate(): void {
    if (!this.props.protocol.trim()) {
      throw new Error('Support ticket protocol is required');
    }

    if (!this.props.requesterId) {
      throw new Error('Support ticket requester id is required');
    }

    if (!this.props.subject.trim()) {
      throw new Error('Support ticket subject is required');
    }
  }
}
