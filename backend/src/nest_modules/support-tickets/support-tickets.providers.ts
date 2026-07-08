import {
  USER_REPOSITORY,
  UserRepository,
} from '../../core/users/domain/contracts/user-repository.interface';
import { SUPPORT_TICKET_REPOSITORY } from '../../core/support-tickets/domain/contracts/support-ticket-repository.interface';
import { CreateSupportTicketUseCase } from '../../core/support-tickets/application/use_case/create-support-ticket.use-case';
import { GetSupportTicketByIdUseCase } from '../../core/support-tickets/application/use_case/get-support-ticket-by-id.use-case';
import { ListSupportTicketsUseCase } from '../../core/support-tickets/application/use_case/list-support-tickets.use-case';
import { SupportTicketSequelizeRepository } from '../../core/support-tickets/infrastructure/database/sequelize/repositories/support-ticket.repository';

export const CREATE_SUPPORT_TICKET_USE_CASE = Symbol(
  'CREATE_SUPPORT_TICKET_USE_CASE',
);
export const LIST_SUPPORT_TICKETS_USE_CASE = Symbol(
  'LIST_SUPPORT_TICKETS_USE_CASE',
);
export const GET_SUPPORT_TICKET_BY_ID_USE_CASE = Symbol(
  'GET_SUPPORT_TICKET_BY_ID_USE_CASE',
);

export const supportTicketsProviders = [
  {
    provide: SUPPORT_TICKET_REPOSITORY,
    useClass: SupportTicketSequelizeRepository,
  },
  {
    provide: CREATE_SUPPORT_TICKET_USE_CASE,
    useFactory: (
      supportTicketRepository: SupportTicketSequelizeRepository,
      userRepository: UserRepository,
    ) =>
      new CreateSupportTicketUseCase(
        supportTicketRepository,
        userRepository,
      ),
    inject: [SUPPORT_TICKET_REPOSITORY, USER_REPOSITORY],
  },
  {
    provide: LIST_SUPPORT_TICKETS_USE_CASE,
    useFactory: (supportTicketRepository: SupportTicketSequelizeRepository) =>
      new ListSupportTicketsUseCase(supportTicketRepository),
    inject: [SUPPORT_TICKET_REPOSITORY],
  },
  {
    provide: GET_SUPPORT_TICKET_BY_ID_USE_CASE,
    useFactory: (supportTicketRepository: SupportTicketSequelizeRepository) =>
      new GetSupportTicketByIdUseCase(supportTicketRepository),
    inject: [SUPPORT_TICKET_REPOSITORY],
  },
];
