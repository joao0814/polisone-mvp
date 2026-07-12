import { CalendarEventRepository } from '../../domain/contracts/calendar-event-repository.interface';
import { ListCalendarEventsInput } from '../../domain/contracts/calendar-event.types';

export class ListCalendarEventsUseCase {
  constructor(private readonly repository: CalendarEventRepository) {}

  execute(query: ListCalendarEventsInput) {
    return this.repository.list(query);
  }
}
