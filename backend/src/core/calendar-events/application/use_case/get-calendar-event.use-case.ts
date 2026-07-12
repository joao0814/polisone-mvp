import { CalendarEventRepository } from '../../domain/contracts/calendar-event-repository.interface';

export class GetCalendarEventUseCase {
  constructor(private readonly repository: CalendarEventRepository) {}

  execute(id: string) {
    return this.repository.get(id);
  }
}
