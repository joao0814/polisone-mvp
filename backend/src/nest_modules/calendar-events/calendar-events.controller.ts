import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateCalendarEventUseCase,
  DeleteCalendarEventUseCase,
  GetCalendarEventAuditUseCase,
  GetCalendarEventUseCase,
  ListCalendarEventsUseCase,
  ListCalendarMonthMarkersUseCase,
  UpdateCalendarEventUseCase,
} from '../../core/calendar-events/application/use_case/calendar-event.use-cases';
import { UserRole } from '../../core/users/domain/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { calendarEventUseCaseTokens } from './calendar-events.providers';
import {
  CreateCalendarEventDto,
  ListCalendarEventsDto,
  ListCalendarMonthMarkersDto,
  UpdateCalendarEventDto,
} from './dto/calendar-events.dto';
import { CalendarEventPresenter } from './presenters/calendar-event.presenter';

@ApiTags('Calendario')
@ApiBearerAuth()
@Controller('calendar-events')
@UseGuards(JwtAuthGuard)
export class CalendarEventsController {
  constructor(
    @Inject(calendarEventUseCaseTokens.list)
    private readonly listUC: ListCalendarEventsUseCase,
    @Inject(calendarEventUseCaseTokens.get)
    private readonly getUC: GetCalendarEventUseCase,
    @Inject(calendarEventUseCaseTokens.monthMarkers)
    private readonly monthMarkersUC: ListCalendarMonthMarkersUseCase,
  ) {}

  @Get()
  async list(@Query() query: ListCalendarEventsDto) {
    return CalendarEventPresenter.toHTTPList(await this.listUC.execute(query));
  }

  @Get('month-markers')
  monthMarkers(@Query() query: ListCalendarMonthMarkersDto) {
    return this.monthMarkersUC.execute(query);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return CalendarEventPresenter.toHTTP(await this.getUC.execute(id));
  }
}

@ApiTags('Administracao de calendario')
@ApiBearerAuth()
@Controller('admin/calendar-events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class AdminCalendarEventsController {
  constructor(
    @Inject(calendarEventUseCaseTokens.list)
    private readonly listUC: ListCalendarEventsUseCase,
    @Inject(calendarEventUseCaseTokens.get)
    private readonly getUC: GetCalendarEventUseCase,
    @Inject(calendarEventUseCaseTokens.create)
    private readonly createUC: CreateCalendarEventUseCase,
    @Inject(calendarEventUseCaseTokens.update)
    private readonly updateUC: UpdateCalendarEventUseCase,
    @Inject(calendarEventUseCaseTokens.delete)
    private readonly deleteUC: DeleteCalendarEventUseCase,
    @Inject(calendarEventUseCaseTokens.audit)
    private readonly auditUC: GetCalendarEventAuditUseCase,
  ) {}

  @Get()
  list(@Query() query: ListCalendarEventsDto) {
    return this.listUC.execute(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.getUC.execute(id);
  }

  @Post()
  create(
    @Body() dto: CreateCalendarEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createUC.execute(dto, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCalendarEventDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.updateUC.execute(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.deleteUC.execute(id, user.sub);
  }

  @Get(':id/audit')
  audit(@Param('id') id: string) {
    return this.auditUC.execute(id);
  }
}
