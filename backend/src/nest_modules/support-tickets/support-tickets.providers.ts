import { SUPPORT_TICKET_REPOSITORY } from '../../core/support-tickets/domain/contracts/support-ticket-repository.interface';
import { SupportTicketSequelizeRepository } from '../../core/support-tickets/infrastructure/database/sequelize/repositories/support-ticket.repository';

export const supportTicketsProviders = [
  {
    provide: SUPPORT_TICKET_REPOSITORY,
    useClass: SupportTicketSequelizeRepository,
  },
];
