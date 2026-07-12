import { CalendarEventRepository } from '../../domain/contracts/calendar-event-repository.interface';
import { ListCalendarMonthMarkersInput } from '../../domain/contracts/calendar-event.types';

export class ListCalendarMonthMarkersUseCase {
  constructor(private readonly repository: CalendarEventRepository) {}

  execute(query: ListCalendarMonthMarkersInput) {
    return this.repository.listMonthMarkers(query);
  }
}
