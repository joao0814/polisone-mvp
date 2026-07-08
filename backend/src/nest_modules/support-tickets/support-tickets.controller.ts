import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateSupportTicketUseCase } from '../../core/support-tickets/application/use_case/create-support-ticket.use-case';
import { GetSupportTicketByIdUseCase } from '../../core/support-tickets/application/use_case/get-support-ticket-by-id.use-case';
import { ListSupportTicketsUseCase } from '../../core/support-tickets/application/use_case/list-support-tickets.use-case';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ListSupportTicketsDto } from './dto/list-support-tickets.dto';
import { SupportTicketPresenter } from './presenters/support-ticket.presenter';
import {
  CREATE_SUPPORT_TICKET_USE_CASE,
  GET_SUPPORT_TICKET_BY_ID_USE_CASE,
  LIST_SUPPORT_TICKETS_USE_CASE,
} from './support-tickets.providers';

@Controller('support-tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketsController {
  constructor(
    @Inject(CREATE_SUPPORT_TICKET_USE_CASE)
    private readonly createSupportTicketUseCase: CreateSupportTicketUseCase,
    @Inject(LIST_SUPPORT_TICKETS_USE_CASE)
    private readonly listSupportTicketsUseCase: ListSupportTicketsUseCase,
    @Inject(GET_SUPPORT_TICKET_BY_ID_USE_CASE)
    private readonly getSupportTicketByIdUseCase: GetSupportTicketByIdUseCase,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateSupportTicketDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    try {
      const output = await this.createSupportTicketUseCase.execute({
        requesterId: currentUser.sub,
        subject: dto.subject,
        department: dto.department,
        subcategory: dto.subcategory,
        priority: dto.priority,
      });

      return SupportTicketPresenter.toHTTP(output);
    } catch (error) {
      if (error instanceof Error && error.message === 'Requester not found') {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }

  @Get()
  async list(
    @Query() query: ListSupportTicketsDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const output = await this.listSupportTicketsUseCase.execute({
      currentUserId: currentUser.sub,
      currentUserRoles: currentUser.roles,
      status: query.status,
      search: query.search,
      page: toPositiveInteger(query.page),
      limit: toPositiveInteger(query.limit),
    });

    return SupportTicketPresenter.listToHTTP(output);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    try {
      const output = await this.getSupportTicketByIdUseCase.execute({
        id,
        currentUserId: currentUser.sub,
        currentUserRoles: currentUser.roles,
      });

      return SupportTicketPresenter.toHTTP(output);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Support ticket not found'
      ) {
        throw new NotFoundException(error.message);
      }

      if (
        error instanceof Error &&
        error.message === 'Support ticket access denied'
      ) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }
  }
}

function toPositiveInteger(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}
