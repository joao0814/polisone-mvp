import { CalendarEventStatus } from '../enums/calendar-event-status.enum';
import { CalendarEventRecurrenceType } from '../enums/calendar-event-recurrence-type.enum';

export interface CalendarEventProps {
  id?: string;
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
  createdBy: string;
  updatedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CalendarEventEntity {
  private constructor(private readonly props: CalendarEventProps) {}

  static create(props: CalendarEventProps) {
    const entity = new CalendarEventEntity({
      ...props,
      title: props.title.trim(),
      description: props.description?.trim() || null,
      category: props.category?.trim() || null,
      status: props.status ?? CalendarEventStatus.ACTIVE,
      recurrenceType: props.recurrenceType ?? CalendarEventRecurrenceType.NONE,
      recurrenceInterval: props.recurrenceInterval ?? 1,
      recurrenceUntil: props.recurrenceUntil ?? null,
      recurrenceDays: props.recurrenceDays?.length
        ? [...props.recurrenceDays].sort((a, b) => a - b)
        : null,
      startTime: props.allDay ? null : (props.startTime ?? null),
      endTime: props.allDay ? null : (props.endTime ?? null),
    });
    entity.validate();
    return entity;
  }

  private validate() {
    if (this.props.title.length < 3)
      throw new Error('Calendar event title is required');
    if (!this.props.eventDate)
      throw new Error('Calendar event date is required');
    if (!this.props.createdBy)
      throw new Error('Calendar event author is required');
    if (this.props.allDay) return;
    if (!this.props.startTime || !this.props.endTime)
      throw new Error('Timed events require start and end times');
    if (this.props.endTime <= this.props.startTime)
      throw new Error('End time must be greater than start time');
    if (
      (this.props.recurrenceType ?? CalendarEventRecurrenceType.NONE) !==
        CalendarEventRecurrenceType.NONE &&
      this.props.recurrenceUntil &&
      this.props.recurrenceUntil < this.props.eventDate
    )
      throw new Error('Recurrence end date must be on or after event date');
  }

  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description ?? null;
  }
  get eventDate() {
    return this.props.eventDate;
  }
  get allDay() {
    return this.props.allDay;
  }
  get startTime() {
    return this.props.startTime ?? null;
  }
  get endTime() {
    return this.props.endTime ?? null;
  }
  get category() {
    return this.props.category ?? null;
  }
  get status() {
    return this.props.status ?? CalendarEventStatus.ACTIVE;
  }
  get recurrenceType() {
    return this.props.recurrenceType ?? CalendarEventRecurrenceType.NONE;
  }
  get recurrenceInterval() {
    return this.props.recurrenceInterval ?? 1;
  }
  get recurrenceUntil() {
    return this.props.recurrenceUntil ?? null;
  }
  get recurrenceDays() {
    return this.props.recurrenceDays ?? null;
  }
}
