import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { SupportTicketRepository } from '../../domain/contracts/support-ticket-repository.interface';
import {
  SupportTicketOutput,
  SupportTicketOutputMapper,
} from '../shared/support-ticket.output';

export type GetSupportTicketByIdInput = {
  id: string;
  currentUserId: string;
  currentUserRoles: UserRole[];
};

export class GetSupportTicketByIdUseCase {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepository,
  ) {}

  async execute(
    input: GetSupportTicketByIdInput,
  ): Promise<SupportTicketOutput> {
    const ticket = await this.supportTicketRepository.findById(input.id);

    if (!ticket) {
      throw new Error('Support ticket not found');
    }

    const canViewAll =
      input.currentUserRoles.includes(UserRole.ADMIN) ||
      input.currentUserRoles.includes(UserRole.MANAGER);

    if (!canViewAll && ticket.requesterId !== input.currentUserId) {
      throw new Error('Support ticket access denied');
    }

    return SupportTicketOutputMapper.toOutput(ticket);
  }
}
