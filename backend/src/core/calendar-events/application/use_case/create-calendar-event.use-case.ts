import { CalendarEventEntity } from '../../domain/entities/calendar-event.entity';
import { CalendarEventRepository } from '../../domain/contracts/calendar-event-repository.interface';
import { CreateCalendarEventInput } from '../../domain/contracts/calendar-event.types';

export class CreateCalendarEventUseCase {
  constructor(private readonly repository: CalendarEventRepository) {}

  execute(dto: CreateCalendarEventInput, actorId: string) {
    const entity = CalendarEventEntity.create({
      ...dto,
      createdBy: actorId,
      updatedBy: actorId,
    });

    return this.repository.create(
      {
        title: entity.title,
        description: entity.description,
        eventDate: entity.eventDate,
        allDay: entity.allDay,
        startTime: entity.startTime,
        endTime: entity.endTime,
        category: entity.category,
        status: entity.status,
        recurrenceType: entity.recurrenceType,
        recurrenceInterval: entity.recurrenceInterval,
        recurrenceUntil: entity.recurrenceUntil,
        recurrenceDays: entity.recurrenceDays,
      },
      actorId,
    );
  }
}
