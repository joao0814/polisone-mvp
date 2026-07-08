import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AddSupportTicketMessageUseCase } from '../../core/support-tickets/application/use_case/add-support-ticket-message.use-case';
import { CloseSupportTicketUseCase } from '../../core/support-tickets/application/use_case/close-support-ticket.use-case';
import { CreateSupportTicketUseCase } from '../../core/support-tickets/application/use_case/create-support-ticket.use-case';
import { GetSupportTicketByIdUseCase } from '../../core/support-tickets/application/use_case/get-support-ticket-by-id.use-case';
import { ListSupportTicketsUseCase } from '../../core/support-tickets/application/use_case/list-support-tickets.use-case';
import { ReopenSupportTicketUseCase } from '../../core/support-tickets/application/use_case/reopen-support-ticket.use-case';
import { UpdateSupportTicketStatusUseCase } from '../../core/support-tickets/application/use_case/update-support-ticket-status.use-case';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AddSupportTicketMessageDto } from './dto/add-support-ticket-message.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { ListSupportTicketsDto } from './dto/list-support-tickets.dto';
import { SupportTicketActionMessageDto } from './dto/support-ticket-action-message.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';
import { SupportTicketPresenter } from './presenters/support-ticket.presenter';
import {
  ADD_SUPPORT_TICKET_MESSAGE_USE_CASE,
  CLOSE_SUPPORT_TICKET_USE_CASE,
  CREATE_SUPPORT_TICKET_USE_CASE,
  GET_SUPPORT_TICKET_BY_ID_USE_CASE,
  LIST_SUPPORT_TICKETS_USE_CASE,
  REOPEN_SUPPORT_TICKET_USE_CASE,
  UPDATE_SUPPORT_TICKET_STATUS_USE_CASE,
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
    @Inject(ADD_SUPPORT_TICKET_MESSAGE_USE_CASE)
    private readonly addSupportTicketMessageUseCase: AddSupportTicketMessageUseCase,
    @Inject(UPDATE_SUPPORT_TICKET_STATUS_USE_CASE)
    private readonly updateSupportTicketStatusUseCase: UpdateSupportTicketStatusUseCase,
    @Inject(CLOSE_SUPPORT_TICKET_USE_CASE)
    private readonly closeSupportTicketUseCase: CloseSupportTicketUseCase,
    @Inject(REOPEN_SUPPORT_TICKET_USE_CASE)
    private readonly reopenSupportTicketUseCase: ReopenSupportTicketUseCase,
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

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Body() dto: AddSupportTicketMessageDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    try {
      const output = await this.addSupportTicketMessageUseCase.execute({
        ticketId: id,
        senderId: currentUser.sub,
        senderRoles: currentUser.roles,
        message: dto.message,
      });

      return SupportTicketPresenter.messageToHTTP(output);
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

      if (
        error instanceof Error &&
        error.message === 'Support ticket message content is required'
      ) {
        throw new BadRequestException(error.message);
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

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSupportTicketStatusDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    try {
      const output = await this.updateSupportTicketStatusUseCase.execute({
        ticketId: id,
        currentUserId: currentUser.sub,
        currentUserRoles: currentUser.roles,
        status: dto.status,
      });

      return SupportTicketPresenter.toHTTP(output);
    } catch (error) {
      if (error instanceof Error && error.message === 'Support ticket not found') {
        throw new NotFoundException(error.message);
      }

      if (
        error instanceof Error &&
        error.message === 'Support ticket status update denied'
      ) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }
  }

  @Patch(':id/close')
  async close(
    @Param('id') id: string,
    @Body() dto: SupportTicketActionMessageDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    try {
      const output = await this.closeSupportTicketUseCase.execute({
        ticketId: id,
        currentUserId: currentUser.sub,
        currentUserRoles: currentUser.roles,
        message: dto.message,
      });

      return SupportTicketPresenter.toHTTP(output);
    } catch (error) {
      if (error instanceof Error && error.message === 'Support ticket not found') {
        throw new NotFoundException(error.message);
      }

      if (error instanceof Error && error.message === 'Support ticket close denied') {
        throw new UnauthorizedException(error.message);
      }

      if (error instanceof Error && error.message === 'Support ticket is already closed') {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  @Patch(':id/reopen')
  async reopen(
    @Param('id') id: string,
    @Body() dto: SupportTicketActionMessageDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    try {
      const output = await this.reopenSupportTicketUseCase.execute({
        ticketId: id,
        currentUserId: currentUser.sub,
        currentUserRoles: currentUser.roles,
        message: dto.message,
      });

      return SupportTicketPresenter.toHTTP(output);
    } catch (error) {
      if (error instanceof Error && error.message === 'Support ticket not found') {
        throw new NotFoundException(error.message);
      }

      if (error instanceof Error && error.message === 'Support ticket reopen denied') {
        throw new UnauthorizedException(error.message);
      }

      if (error instanceof Error && error.message === 'Support ticket is not closed') {
        throw new BadRequestException(error.message);
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
