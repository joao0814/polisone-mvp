import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CalendarEventRecurrenceType } from '../../../core/calendar-events/domain/enums/calendar-event-recurrence-type.enum';
import { CalendarEventStatus } from '../../../core/calendar-events/domain/enums/calendar-event-status.enum';

export class ListCalendarEventsDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsEnum(CalendarEventStatus)
  status?: CalendarEventStatus;

  @IsOptional()
  @IsEnum(CalendarEventRecurrenceType)
  recurrenceType?: CalendarEventRecurrenceType;
}

export class ListCalendarMonthMarkersDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(2000)
  year!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;
}

export class CreateCalendarEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  eventDate!: string;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  allDay!: boolean;

  @IsOptional()
  @IsString()
  startTime?: string | null;

  @IsOptional()
  @IsString()
  endTime?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string | null;

  @IsOptional()
  @IsEnum(CalendarEventStatus)
  status?: CalendarEventStatus;

  @IsOptional()
  @IsEnum(CalendarEventRecurrenceType)
  recurrenceType?: CalendarEventRecurrenceType;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  recurrenceInterval?: number;

  @IsOptional()
  @IsString()
  recurrenceUntil?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((item) => Number(item))
      : typeof value === 'string' && value.length
        ? value.split(',').map((item) => Number(item.trim()))
        : [],
  )
  recurrenceDays?: number[] | null;
}

export class UpdateCalendarEventDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  eventDate?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  startTime?: string | null;

  @IsOptional()
  @IsString()
  endTime?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string | null;

  @IsOptional()
  @IsEnum(CalendarEventStatus)
  status?: CalendarEventStatus;

  @IsOptional()
  @IsEnum(CalendarEventRecurrenceType)
  recurrenceType?: CalendarEventRecurrenceType;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  recurrenceInterval?: number;

  @IsOptional()
  @IsString()
  recurrenceUntil?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((item) => Number(item))
      : typeof value === 'string' && value.length
        ? value.split(',').map((item) => Number(item.trim()))
        : [],
  )
  recurrenceDays?: number[] | null;
}
