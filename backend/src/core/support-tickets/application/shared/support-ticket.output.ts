import { SupportTicketEntity } from '../../domain/entities/support-ticket.entity';
import { SupportTicketDepartment } from '../../domain/enums/support-ticket-department.enum';
import { SupportTicketPriority } from '../../domain/enums/support-ticket-priority.enum';
import { SupportTicketStatus } from '../../domain/enums/support-ticket-status.enum';

export type SupportTicketOutput = {
  id: string;
  protocol: string;
  requesterId: string;
  subject: string;
  department: SupportTicketDepartment;
  subcategory: string | null;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
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
      closedAt: ticket.closedAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }
}
