import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { SupportTicketRepository } from '../../domain/contracts/support-ticket-repository.interface';
import { SupportTicketStatus } from '../../domain/enums/support-ticket-status.enum';
import {
  SupportTicketOutput,
  SupportTicketOutputMapper,
} from '../shared/support-ticket.output';

export type UpdateSupportTicketStatusInput = {
  ticketId: string;
  currentUserId: string;
  currentUserRoles: UserRole[];
  status: SupportTicketStatus;
};

export class UpdateSupportTicketStatusUseCase {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepository,
  ) {}

  async execute(
    input: UpdateSupportTicketStatusInput,
  ): Promise<SupportTicketOutput> {
    const ticket = await this.supportTicketRepository.findById(input.ticketId);

    if (!ticket) {
      throw new Error('Support ticket not found');
    }

    const canManage =
      input.currentUserRoles.includes(UserRole.ADMIN) ||
      input.currentUserRoles.includes(UserRole.MANAGER);

    if (!canManage) {
      throw new Error('Support ticket status update denied');
    }

    const updatedTicket = await this.supportTicketRepository.updateStatus(
      input.ticketId,
      input.status,
      input.status === SupportTicketStatus.CLOSED ? new Date() : null,
    );

    if (!updatedTicket) {
      throw new Error('Support ticket not found');
    }

    return SupportTicketOutputMapper.toOutput(updatedTicket);
  }
}
