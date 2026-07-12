import { Provider } from '@nestjs/common';
import {
  CreateCalendarEventUseCase,
  DeleteCalendarEventUseCase,
  GetCalendarEventAuditUseCase,
  GetCalendarEventUseCase,
  ListCalendarEventsUseCase,
  ListCalendarMonthMarkersUseCase,
  UpdateCalendarEventUseCase,
} from '../../core/calendar-events/application/use_case/calendar-event.use-cases';
import {
  CALENDAR_EVENT_REPOSITORY,
  CalendarEventRepository,
} from '../../core/calendar-events/domain/contracts/calendar-event-repository.interface';

export const calendarEventUseCaseTokens = {
  list: 'LIST_CALENDAR_EVENTS_USE_CASE',
  get: 'GET_CALENDAR_EVENT_USE_CASE',
  create: 'CREATE_CALENDAR_EVENT_USE_CASE',
  update: 'UPDATE_CALENDAR_EVENT_USE_CASE',
  delete: 'DELETE_CALENDAR_EVENT_USE_CASE',
  monthMarkers: 'LIST_CALENDAR_MONTH_MARKERS_USE_CASE',
  audit: 'GET_CALENDAR_EVENT_AUDIT_USE_CASE',
} as const;

const factory = <T>(
  token: string,
  Type: new (repository: CalendarEventRepository) => T,
): Provider => ({
  provide: token,
  inject: [CALENDAR_EVENT_REPOSITORY],
  useFactory: (repository: CalendarEventRepository) => new Type(repository),
});

export const calendarEventProviders: Provider[] = [
  factory(calendarEventUseCaseTokens.list, ListCalendarEventsUseCase),
  factory(calendarEventUseCaseTokens.get, GetCalendarEventUseCase),
  factory(calendarEventUseCaseTokens.create, CreateCalendarEventUseCase),
  factory(calendarEventUseCaseTokens.update, UpdateCalendarEventUseCase),
  factory(calendarEventUseCaseTokens.delete, DeleteCalendarEventUseCase),
  factory(
    calendarEventUseCaseTokens.monthMarkers,
    ListCalendarMonthMarkersUseCase,
  ),
  factory(calendarEventUseCaseTokens.audit, GetCalendarEventAuditUseCase),
];
