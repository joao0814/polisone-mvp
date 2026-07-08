import {
  USER_REPOSITORY,
  UserRepository,
} from '../../core/users/domain/contracts/user-repository.interface';
import { AddSupportTicketMessageUseCase } from '../../core/support-tickets/application/use_case/add-support-ticket-message.use-case';
import { CloseSupportTicketUseCase } from '../../core/support-tickets/application/use_case/close-support-ticket.use-case';
import { SUPPORT_TICKET_REPOSITORY } from '../../core/support-tickets/domain/contracts/support-ticket-repository.interface';
import { CreateSupportTicketUseCase } from '../../core/support-tickets/application/use_case/create-support-ticket.use-case';
import { GetSupportTicketByIdUseCase } from '../../core/support-tickets/application/use_case/get-support-ticket-by-id.use-case';
import { ListSupportTicketsUseCase } from '../../core/support-tickets/application/use_case/list-support-tickets.use-case';
import { ReopenSupportTicketUseCase } from '../../core/support-tickets/application/use_case/reopen-support-ticket.use-case';
import { UpdateSupportTicketStatusUseCase } from '../../core/support-tickets/application/use_case/update-support-ticket-status.use-case';
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
export const ADD_SUPPORT_TICKET_MESSAGE_USE_CASE = Symbol(
  'ADD_SUPPORT_TICKET_MESSAGE_USE_CASE',
);
export const UPDATE_SUPPORT_TICKET_STATUS_USE_CASE = Symbol(
  'UPDATE_SUPPORT_TICKET_STATUS_USE_CASE',
);
export const CLOSE_SUPPORT_TICKET_USE_CASE = Symbol(
  'CLOSE_SUPPORT_TICKET_USE_CASE',
);
export const REOPEN_SUPPORT_TICKET_USE_CASE = Symbol(
  'REOPEN_SUPPORT_TICKET_USE_CASE',
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
  {
    provide: ADD_SUPPORT_TICKET_MESSAGE_USE_CASE,
    useFactory: (supportTicketRepository: SupportTicketSequelizeRepository) =>
      new AddSupportTicketMessageUseCase(supportTicketRepository),
    inject: [SUPPORT_TICKET_REPOSITORY],
  },
  {
    provide: UPDATE_SUPPORT_TICKET_STATUS_USE_CASE,
    useFactory: (supportTicketRepository: SupportTicketSequelizeRepository) =>
      new UpdateSupportTicketStatusUseCase(supportTicketRepository),
    inject: [SUPPORT_TICKET_REPOSITORY],
  },
  {
    provide: CLOSE_SUPPORT_TICKET_USE_CASE,
    useFactory: (supportTicketRepository: SupportTicketSequelizeRepository) =>
      new CloseSupportTicketUseCase(supportTicketRepository),
    inject: [SUPPORT_TICKET_REPOSITORY],
  },
  {
    provide: REOPEN_SUPPORT_TICKET_USE_CASE,
    useFactory: (supportTicketRepository: SupportTicketSequelizeRepository) =>
      new ReopenSupportTicketUseCase(supportTicketRepository),
    inject: [SUPPORT_TICKET_REPOSITORY],
  },
];
