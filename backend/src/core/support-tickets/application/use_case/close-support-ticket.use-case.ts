import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { SupportTicketMessageEntity } from '../../domain/entities/support-ticket-message.entity';
import { SupportTicketMessageType } from '../../domain/enums/support-ticket-message-type.enum';
import { SupportTicketRepository } from '../../domain/contracts/support-ticket-repository.interface';
import { SupportTicketStatus } from '../../domain/enums/support-ticket-status.enum';
import {
  SupportTicketOutput,
  SupportTicketOutputMapper,
} from '../shared/support-ticket.output';

export type CloseSupportTicketInput = {
  ticketId: string;
  currentUserId: string;
  currentUserRoles: UserRole[];
  message: string;
};

export class CloseSupportTicketUseCase {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepository,
  ) {}

  async execute(input: CloseSupportTicketInput): Promise<SupportTicketOutput> {
    const ticket = await this.supportTicketRepository.findById(input.ticketId);

    if (!ticket) {
      throw new Error('Support ticket not found');
    }

    const canManage =
      input.currentUserRoles.includes(UserRole.ADMIN) ||
      input.currentUserRoles.includes(UserRole.MANAGER) ||
      ticket.requesterId === input.currentUserId;

    if (!canManage) {
      throw new Error('Support ticket close denied');
    }

    if (ticket.status === SupportTicketStatus.CLOSED) {
      throw new Error('Support ticket is already closed');
    }

    await this.supportTicketRepository.addMessage(
      SupportTicketMessageEntity.create({
        ticketId: input.ticketId,
        senderId: input.currentUserId,
        message: input.message,
        type: SupportTicketMessageType.CLOSE,
      }),
    );

    const updatedTicket = await this.supportTicketRepository.updateStatus(
      input.ticketId,
      SupportTicketStatus.CLOSED,
      new Date(),
    );

    if (!updatedTicket) {
      throw new Error('Support ticket not found');
    }

    return SupportTicketOutputMapper.toOutput(updatedTicket);
  }
}
