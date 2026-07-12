import { CalendarEventStatus } from '../enums/calendar-event-status.enum';
import { CalendarEventRecurrenceType } from '../enums/calendar-event-recurrence-type.enum';

export interface ListCalendarEventsInput {
  page?: number;
  limit?: number;
  search?: string;
  date?: string;
  from?: string;
  to?: string;
  status?: CalendarEventStatus;
  recurrenceType?: CalendarEventRecurrenceType;
}

export interface ListCalendarMonthMarkersInput {
  year: number;
  month: number;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string | null;
  eventDate: string;
  allDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
  category?: string | null;
  status?: CalendarEventStatus;
  recurrenceType?: CalendarEventRecurrenceType;
  recurrenceInterval?: number;
  recurrenceUntil?: string | null;
  recurrenceDays?: number[] | null;
}

export interface UpdateCalendarEventInput {
  title?: string;
  description?: string | null;
  eventDate?: string;
  allDay?: boolean;
  startTime?: string | null;
  endTime?: string | null;
  category?: string | null;
  status?: CalendarEventStatus;
  recurrenceType?: CalendarEventRecurrenceType;
  recurrenceInterval?: number;
  recurrenceUntil?: string | null;
  recurrenceDays?: number[] | null;
}

export interface CalendarEventOutput {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  allDay: boolean;
  startTime: string | null;
  endTime: string | null;
  category: string | null;
  status: CalendarEventStatus;
  recurrenceType: CalendarEventRecurrenceType;
  recurrenceInterval: number;
  recurrenceUntil: string | null;
  recurrenceDays: number[] | null;
  sourceEventDate?: string;
  createdBy: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedCalendarEventsOutput {
  data: CalendarEventOutput[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface CalendarMonthMarkersOutput {
  year: number;
  month: number;
  days: string[];
}

export interface CalendarEventAuditOutput {
  id: string;
  calendarEventId: string;
  actorId: string;
  action: string;
  changes: Record<string, unknown> | null;
  createdAt: Date;
}
