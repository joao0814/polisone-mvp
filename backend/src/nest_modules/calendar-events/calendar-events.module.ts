import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CalendarEventAuditLogModel } from '../../core/calendar-events/infrastructure/database/sequelize/models/calendar-event-audit-log.model';
import { CalendarEventModel } from '../../core/calendar-events/infrastructure/database/sequelize/models/calendar-event.model';
import { CalendarEventSequelizeRepository } from '../../core/calendar-events/infrastructure/database/sequelize/repositories/calendar-event.repository';
import { CALENDAR_EVENT_REPOSITORY } from '../../core/calendar-events/domain/contracts/calendar-event-repository.interface';
import { AuthModule } from '../auth/auth.module';
import {
  AdminCalendarEventsController,
  CalendarEventsController,
} from './calendar-events.controller';
import { calendarEventProviders } from './calendar-events.providers';

export const calendarEventModels = [CalendarEventModel, CalendarEventAuditLogModel];

@Module({
  imports: [AuthModule, SequelizeModule.forFeature(calendarEventModels)],
  controllers: [CalendarEventsController, AdminCalendarEventsController],
  providers: [
    CalendarEventSequelizeRepository,
    {
      provide: CALENDAR_EVENT_REPOSITORY,
      useExisting: CalendarEventSequelizeRepository,
    },
    ...calendarEventProviders,
  ],
  exports: [...calendarEventProviders],
})
export class CalendarEventsModule {}
