import { BadRequestException } from '@nestjs/common';
import { CalendarEventStatus } from '../../domain/enums/calendar-event-status.enum';
import { CalendarEventRecurrenceType } from '../../domain/enums/calendar-event-recurrence-type.enum';
import { CalendarEventRepository } from '../../domain/contracts/calendar-event-repository.interface';
import { UpdateCalendarEventInput } from '../../domain/contracts/calendar-event.types';

export class UpdateCalendarEventUseCase {
  constructor(private readonly repository: CalendarEventRepository) {}

  execute(id: string, dto: UpdateCalendarEventInput, actorId: string) {
    if (dto.title !== undefined && dto.title.trim().length < 3)
      throw new BadRequestException('Calendar event title is required');
    if (
      dto.status !== undefined &&
      !Object.values(CalendarEventStatus).includes(dto.status)
    )
      throw new BadRequestException('Calendar event status is invalid');
    if (
      dto.allDay === false &&
      (dto.startTime === undefined || dto.endTime === undefined)
    )
      throw new BadRequestException('Timed events require start and end times');
    if (
      dto.allDay === false &&
      dto.startTime &&
      dto.endTime &&
      dto.endTime <= dto.startTime
    )
      throw new BadRequestException('End time must be greater than start time');
    if (
      dto.recurrenceType !== undefined &&
      !Object.values(CalendarEventRecurrenceType).includes(dto.recurrenceType)
    )
      throw new BadRequestException('Calendar event recurrence is invalid');

    return this.repository.update(id, dto, actorId);
  }
}
