import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { SupportTicketMessageEntity } from '../../domain/entities/support-ticket-message.entity';
import { SupportTicketRepository } from '../../domain/contracts/support-ticket-repository.interface';
import {
  SupportTicketMessageOutput,
  SupportTicketOutputMapper,
} from '../shared/support-ticket.output';

export type AddSupportTicketMessageInput = {
  ticketId: string;
  senderId: string;
  senderRoles: UserRole[];
  message: string;
};

export class AddSupportTicketMessageUseCase {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepository,
  ) {}

  async execute(
    input: AddSupportTicketMessageInput,
  ): Promise<SupportTicketMessageOutput> {
    const ticket = await this.supportTicketRepository.findById(input.ticketId);

    if (!ticket) {
      throw new Error('Support ticket not found');
    }

    const canInteractWithAnyTicket =
      input.senderRoles.includes(UserRole.ADMIN) ||
      input.senderRoles.includes(UserRole.MANAGER);

    if (!canInteractWithAnyTicket && ticket.requesterId !== input.senderId) {
      throw new Error('Support ticket access denied');
    }

    const message = SupportTicketMessageEntity.create({
      ticketId: input.ticketId,
      senderId: input.senderId,
      message: input.message,
    });

    const storedMessage =
      await this.supportTicketRepository.addMessage(message);

    return SupportTicketOutputMapper['messageToOutput'](storedMessage);
  }
}
