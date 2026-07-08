import { SupportTicketMessageEntity } from '../../domain/entities/support-ticket-message.entity';
import { UserRepository } from '../../../users/domain/contracts/user-repository.interface';
import { SupportTicketRepository } from '../../domain/contracts/support-ticket-repository.interface';
import { SupportTicketEntity } from '../../domain/entities/support-ticket.entity';
import { SupportTicketDepartment } from '../../domain/enums/support-ticket-department.enum';
import { SupportTicketMessageType } from '../../domain/enums/support-ticket-message-type.enum';
import { SupportTicketPriority } from '../../domain/enums/support-ticket-priority.enum';
import {
  SupportTicketOutput,
  SupportTicketOutputMapper,
} from '../shared/support-ticket.output';

export type CreateSupportTicketInput = {
  requesterId: string;
  subject: string;
  department: SupportTicketDepartment;
  subcategory?: string;
  priority?: SupportTicketPriority;
  message: string;
};

export class CreateSupportTicketUseCase {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateSupportTicketInput): Promise<SupportTicketOutput> {
    const requester = await this.userRepository.findById(input.requesterId);

    if (!requester || !requester.isActive) {
      throw new Error('Requester not found');
    }

    const ticket = SupportTicketEntity.create({
      protocol: this.generateProtocol(),
      requesterId: input.requesterId,
      subject: input.subject,
      department: input.department,
      subcategory: input.subcategory,
      priority: input.priority,
    });

    const storedTicket = await this.supportTicketRepository.store(ticket);
    await this.supportTicketRepository.addMessage(
      SupportTicketMessageEntity.create({
        ticketId: storedTicket.id,
        senderId: input.requesterId,
        message: input.message,
        type: SupportTicketMessageType.MESSAGE,
      }),
    );

    const completeTicket = await this.supportTicketRepository.findById(
      storedTicket.id,
    );

    if (!completeTicket) {
      throw new Error('Support ticket not found');
    }

    return SupportTicketOutputMapper.toOutput(completeTicket);
  }

  private generateProtocol(): string {
    const timestamp = Date.now().toString().slice(-8);
    const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();

    return `CH-${timestamp}-${randomSuffix}`;
  }
}
