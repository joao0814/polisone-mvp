import { CalendarEventStatus } from '../enums/calendar-event-status.enum';
import {
  CalendarEventOutput,
  CalendarEventAuditOutput,
  CalendarMonthMarkersOutput,
  CreateCalendarEventInput,
  ListCalendarEventsInput,
  ListCalendarMonthMarkersInput,
  PaginatedCalendarEventsOutput,
  UpdateCalendarEventInput,
} from './calendar-event.types';

export const CALENDAR_EVENT_REPOSITORY = Symbol('CALENDAR_EVENT_REPOSITORY');

export interface CalendarEventRepository {
  list(query: ListCalendarEventsInput): Promise<PaginatedCalendarEventsOutput>;
  get(id: string): Promise<CalendarEventOutput>;
  create(
    dto: CreateCalendarEventInput,
    actorId: string,
  ): Promise<CalendarEventOutput>;
  update(
    id: string,
    dto: UpdateCalendarEventInput,
    actorId: string,
  ): Promise<CalendarEventOutput>;
  remove(id: string, actorId: string): Promise<void>;
  listMonthMarkers(
    query: ListCalendarMonthMarkersInput,
  ): Promise<CalendarMonthMarkersOutput>;
  getAudit(id: string): Promise<CalendarEventAuditOutput[]>;
  updateStatus?(
    id: string,
    status: CalendarEventStatus,
    actorId: string,
  ): Promise<CalendarEventOutput>;
}
