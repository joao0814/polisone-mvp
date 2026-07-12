import { CalendarEventRepository } from '../../domain/contracts/calendar-event-repository.interface';

export class DeleteCalendarEventUseCase {
  constructor(private readonly repository: CalendarEventRepository) {}

  execute(id: string, actorId: string) {
    return this.repository.remove(id, actorId);
  }
}
